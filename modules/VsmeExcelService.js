const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const db = require('../db/db');

/**
 * Helper to safely parse JSON strings or return fallback
 */
const safeParseJson = (val, defaultVal = null) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

/**
 * Format date string (YYYY-MM-DD or similar) into { year, month, day }
 */
const parseDateParts = (dateStr) => {
  if (!dateStr) return null;
  if (typeof dateStr === 'object' && dateStr.year) {
    return {
      year: parseInt(dateStr.year, 10) || null,
      month: parseInt(dateStr.month, 10) || null,
      day: parseInt(dateStr.day, 10) || null
    };
  }
  const str = String(dateStr).trim();

  // YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const matchISO = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (matchISO) {
    return {
      year: parseInt(matchISO[1], 10),
      month: parseInt(matchISO[2], 10),
      day: parseInt(matchISO[3], 10)
    };
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const matchDMY = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (matchDMY) {
    return {
      year: parseInt(matchDMY[3], 10),
      month: parseInt(matchDMY[2], 10),
      day: parseInt(matchDMY[1], 10)
    };
  }

  // 4-digit Year only e.g. "2024"
  const matchYear = str.match(/^(\d{4})$/);
  if (matchYear) {
    return {
      year: parseInt(matchYear[1], 10),
      month: 1,
      day: 1
    };
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate()
    };
  }
  return null;
};

/**
 * Parse cell address like 'E22' into { col: 'E', row: 22 }
 */
const parseCellAddress = (cellRef) => {
  if (!cellRef || typeof cellRef !== 'string') return null;
  const match = cellRef.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (match) {
    return { col: match[1], row: parseInt(match[2], 10) };
  }
  return null;
};

/**
 * Extract column letter and starting row number for table column mapping
 */
const extractColumnCellInfo = (colExcelCell, questionCellRefRaw, colIdx) => {
  let colLetter = '';
  let startRow = null;

  if (colExcelCell && typeof colExcelCell === 'string') {
    const cleanColCell = colExcelCell.trim().toUpperCase();
    const singleMatch = cleanColCell.match(/^([A-Z]+)(\d+)$/);
    if (singleMatch) {
      colLetter = singleMatch[1];
      startRow = parseInt(singleMatch[2], 10);
    } else {
      const rangeMatch = cleanColCell.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
      if (rangeMatch) {
        colLetter = rangeMatch[1];
        startRow = parseInt(rangeMatch[2], 10);
      } else {
        const listMatch = cleanColCell.match(/^([A-Z]+)(\d+)/);
        if (listMatch) {
          colLetter = listMatch[1];
          startRow = parseInt(listMatch[2], 10);
        }
      }
    }
  }

  // Fallback to question level excel cell ref (e.g. "D292:F292" or "D292")
  if (!startRow || !colLetter) {
    if (questionCellRefRaw && typeof questionCellRefRaw === 'string') {
      const qClean = questionCellRefRaw.trim().toUpperCase();
      const qRangeMatch = qClean.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
      if (qRangeMatch) {
        const qStartColLetter = qRangeMatch[1];
        const qStartRow = parseInt(qRangeMatch[2], 10);
        if (!startRow) startRow = qStartRow;
        if (!colLetter) {
          const colCode = qStartColLetter.charCodeAt(0) + colIdx;
          colLetter = String.fromCharCode(colCode);
        }
      } else {
        const qSingleMatch = qClean.match(/^([A-Z]+)(\d+)$/);
        if (qSingleMatch) {
          const qStartColLetter = qSingleMatch[1];
          const qStartRow = parseInt(qSingleMatch[2], 10);
          if (!startRow) startRow = qStartRow;
          if (!colLetter) {
            const colCode = qStartColLetter.charCodeAt(0) + colIdx;
            colLetter = String.fromCharCode(colCode);
          }
        }
      }
    }
  }

  return { colLetter: colLetter || '', startRow: startRow || 1 };
};

/**
 * Smart worksheet resolver matching sheet_name, name_en, or common aliases
 */
const findWorksheet = (workbook, sheetName, categoryNameEn = '') => {
  if (!workbook || !workbook.worksheets || workbook.worksheets.length === 0) return null;

  const targetNames = [];
  if (sheetName) targetNames.push(sheetName.trim().toLowerCase());
  if (categoryNameEn) targetNames.push(categoryNameEn.trim().toLowerCase());

  // Check exact / alias mappings
  const aliasMap = {
    'sheet2': 'general information',
    'sheet1': 'introduction',
    'general': 'general information',
    'general information': 'general information',
    'environmental': 'environmental disclosures',
    'environmental disclosures': 'environmental disclosures',
    'social': 'social disclosures',
    'social disclosures': 'social disclosures',
    'governance': 'governance disclosures',
    'governance disclosures': 'governance disclosures'
  };

  for (let name of targetNames) {
    const canonical = aliasMap[name] || name;

    // 1. Exact name match
    let ws = workbook.getWorksheet(name);
    if (ws) return ws;

    // 2. Canonical name match
    for (let w of workbook.worksheets) {
      if (w.name.toLowerCase() === canonical) return w;
    }

    // 3. Substring match
    for (let w of workbook.worksheets) {
      const wName = w.name.toLowerCase();
      if (wName.includes(canonical) || canonical.includes(wName)) return w;
    }
  }

  // Fallback to General Information or 4th worksheet (index 3)
  return workbook.getWorksheet('General Information') || workbook.worksheets[3] || workbook.worksheets[0];
};

/**
 * Attempt to convert a numeric string (e.g. '50000', '1,000', '12.34', '-50') to Number if valid.
 * Avoid converting strings with leading zeros (e.g. '012345' phone/codes) unless it's '0' or '0.xx'.
 */
const tryParseNumber = (strVal) => {
  if (typeof strVal === 'number') return strVal;
  if (!strVal || typeof strVal !== 'string') return strVal;
  const s = strVal.trim();
  if (s === '') return strVal;

  // Preserve leading zeros for postal/phone/ID codes like "07000" or "01234" (except "0" or "0.123")
  if (/^0\d+/.test(s)) {
    return strVal;
  }

  // Remove formatting commas e.g. "50,000" -> "50000"
  const cleanStr = s.replace(/,/g, '');
  if (/^-?\d+(\.\d+)?$/.test(cleanStr)) {
    const num = Number(cleanStr);
    if (!isNaN(num)) {
      return num;
    }
  }

  return strVal;
};

/**
 * Set cell value safely while handling booleans, numbers, and strings
 */
const setCellValueSafe = (worksheet, cellRef, rawValue, inputType = 'string') => {
  if (!worksheet || !cellRef) return;
  try {
    const cell = worksheet.getCell(cellRef);
    if (!cell) return;

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return;
    }

    if (typeof rawValue === 'boolean') {
      cell.value = rawValue;
      return;
    }

    if (typeof rawValue === 'number') {
      cell.value = rawValue;
      return;
    }

    const strVal = String(rawValue).trim();
    if (strVal.toUpperCase() === 'TRUE') {
      cell.value = true;
      return;
    }
    if (strVal.toUpperCase() === 'FALSE') {
      cell.value = false;
      return;
    }

    if (inputType === 'boolean') {
      const boolStr = strVal.toLowerCase();
      if (boolStr === 'true' || boolStr === '1' || boolStr === 'yes') {
        cell.value = true;
      } else if (boolStr === 'false' || boolStr === '0' || boolStr === 'no') {
        cell.value = false;
      } else {
        cell.value = tryParseNumber(strVal);
      }
      return;
    }

    if (inputType === 'number' || inputType === 'integer' || inputType === 'float') {
      const numStr = strVal.replace(/,/g, '');
      const num = Number(numStr);
      if (!isNaN(num) && numStr !== '') {
        cell.value = num;
      } else {
        cell.value = strVal;
      }
      return;
    }

    // Auto-detect numeric string values even if inputType is 'string' or default
    cell.value = tryParseNumber(strVal);
  } catch (err) {
    console.error(`Error setting cell ${cellRef}:`, err.message);
  }
};

/**
 * Core Service: Feed client data into VSME-Digital-Template-1.3.0.xlsx copy
 * 
 * @param {Object} params
 * @param {number} params.templateId
 * @param {number} params.userId
 * @param {string} params.clientId
 * @param {number} params.projectId
 * @param {Object} [params.overrideAnswers] - In-memory answers if calling right before saving
 * @param {Object} [params.classifiedSections] - { [labelId]: 1 }
 * @returns {Promise<{ suc: number, msg: string, fileName: string, filePath: string, relativePath: string, totalPopulated: number }>}
 */
const generatePopulatedVsmeExcel = async ({
  templateId,
  userId = 0,
  clientId = '0',
  projectId = 0,
  overrideAnswers = null,
  classifiedSections = {}
}) => {
  const promiseDb = db.promise();
  try {
    const targetTemplateId = parseInt(templateId || 0, 10);
    const targetProjectId = parseInt(projectId || 0, 10);
    let effectiveClientId = String(clientId || '0');

    // 1. Resolve effective client ID from td_project if project_id is given
    if (targetProjectId > 0) {
      try {
        const [projRows] = await promiseDb.query(`SELECT client_id, project_name FROM td_project WHERE id = ?`, [targetProjectId]);
        if (projRows && projRows.length > 0 && projRows[0].client_id) {
          effectiveClientId = String(projRows[0].client_id);
        }
      } catch (e) {
        console.error('Error resolving project in generatePopulatedVsmeExcel:', e);
      }
    }

    // 2. Fetch all template questions and categories
    const [questions] = await promiseDb.query(
      `SELECT q.*, l.category_id, l.name_en AS label_name_en, c.sheet_name, c.name_en AS cat_name_en, c.name_fr AS cat_name_fr
       FROM md_vsme_questions q
       JOIN md_vsme_lables l ON q.label_id = l.id
       JOIN md_vsme_categories c ON l.category_id = c.id
       WHERE c.template_id = ?
       ORDER BY c.order_index ASC, l.order_index ASC, q.order_index ASC, q.id ASC`,
      [targetTemplateId]
    );

    if (!questions || questions.length === 0) {
      return { suc: 0, msg: `No questions found for VSME template #${targetTemplateId}`, filePath: null };
    }

    // 3. Fetch client responses from DB if overrideAnswers is not provided
    const answersMap = {};
    if (overrideAnswers && typeof overrideAnswers === 'object' && Object.keys(overrideAnswers).length > 0) {
      for (const k of Object.keys(overrideAnswers)) {
        answersMap[k] = overrideAnswers[k];
      }
    } else {
      let respQuery = '';
      let respParams = [];
      if (targetProjectId > 0) {
        respQuery = `SELECT * FROM td_vsme_responses WHERE template_id = ? AND (project_id = ? OR (client_id = ? AND project_id = 0))`;
        respParams = [targetTemplateId, targetProjectId, effectiveClientId];
      } else {
        respQuery = `SELECT * FROM td_vsme_responses WHERE template_id = ? AND (user_id = ? OR client_id = ?) AND project_id = 0`;
        respParams = [targetTemplateId, userId || 0, effectiveClientId];
      }
      const [savedResponses] = await promiseDb.query(respQuery, respParams);
      if (savedResponses && savedResponses.length > 0) {
        savedResponses.forEach(r => {
          answersMap[r.question_id] = {
            answer_val: r.answer_val,
            calculated_val: r.calculated_val,
            is_classified: r.is_classified,
            label_id: r.label_id,
            category_id: r.category_id,
            excel_cell_ref: r.excel_cell_ref,
            sheet_name: r.sheet_name
          };
          if (r.is_classified) {
            classifiedSections[r.label_id] = 1;
          }
        });
      }
    }

    // 4. Locate Base Template
    const templateFileName = 'VSME-Digital-Template-1.3.0.xlsx';
    const possibleBasePaths = [
      path.join(__dirname, '..', templateFileName),
      path.join(process.cwd(), templateFileName),
      path.join(__dirname, '../../', templateFileName)
    ];

    let baseTemplatePath = null;
    for (const p of possibleBasePaths) {
      if (fs.existsSync(p)) {
        baseTemplatePath = p;
        break;
      }
    }

    if (!baseTemplatePath) {
      return { suc: 0, msg: `Master Excel template '${templateFileName}' not found on server.`, filePath: null };
    }

    // 5. Load Master Excel Workbook into ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(baseTemplatePath);

    // 6. Ensure target directories exist
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const assetsVsmeDir = path.join(__dirname, '..', 'assets', 'uploads', 'vsme');
    if (!fs.existsSync(assetsVsmeDir)) {
      fs.mkdirSync(assetsVsmeDir, { recursive: true });
    }

    let populatedCellsCount = 0;

    // 7. Iterate through each question and feed values into exact cells
    const populatedCellRefs = new Set();

    for (const q of questions) {
      const qId = q.id;
      const resp = answersMap[qId];
      if (!resp) continue;

      const rawAnswer = resp.answer_val;
      if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') continue;

      // Check if section is classified
      const isClassified = classifiedSections[q.label_id] || resp.is_classified;
      if (isClassified) {
        // Section is marked as classified/confidential
        continue;
      }

      // Determine Worksheet
      const worksheet = findWorksheet(workbook, q.sheet_name || resp.sheet_name, q.cat_name_en);
      if (!worksheet) {
        console.warn(`Worksheet not found for question #${qId} (sheet_name: ${q.sheet_name}, cat: ${q.cat_name_en})`);
        continue;
      }

      const cellRefRaw = (q.excel_cell_ref || resp.excel_cell_ref || '').trim();
      const inputType = q.input_type || 'string';
      const allowMultiple = q.allow_multiple === 1 || q.allow_multiple === true;
      const hasValueInput = q.has_value_input === 1 || q.has_value_input === true;

      // PARSE DIFFERENT TYPES:

      // A. Table Input Type
      if (inputType === 'table') {
        const tableData = safeParseJson(rawAnswer, []);
        const tableConfig = safeParseJson(q.table_config, {});
        const columns = tableConfig.columns || [];

        // Mark question level cell reference as populated to prevent raw JSON array dumping in fallback
        if (cellRefRaw) populatedCellRefs.add(cellRefRaw);
        if (q.excel_cell_ref) populatedCellRefs.add(q.excel_cell_ref.trim());

        if (Array.isArray(tableData) && tableData.length > 0) {
          tableData.forEach((rowObj, rowIdx) => {
            if (!rowObj || typeof rowObj !== 'object') return;

            columns.forEach((col, colIdx) => {
              const colId = col.col_id || col.id || `col_${colIdx + 1}`;

              let colVal = rowObj[colId];
              if (colVal === undefined && col.col_id) colVal = rowObj[col.col_id];
              if (colVal === undefined) colVal = rowObj[`col_${colIdx + 1}`];
              if (colVal === undefined && col.title) {
                const titleKey = typeof col.title === 'object' ? (col.title.en || Object.values(col.title)[0]) : col.title;
                colVal = rowObj[titleKey];
              }

              if (colVal === undefined || colVal === null || colVal === '') return;

              const { colLetter, startRow } = extractColumnCellInfo(col.excel_cell, cellRefRaw, colIdx);

              if (colLetter && startRow > 0) {
                // Row 0 -> startRow, Row 1 -> startRow + 1, Row 2 -> startRow + 2, etc.
                const currentRowNum = startRow + rowIdx;
                const targetCell = `${colLetter}${currentRowNum}`;
                const colType = col.type || 'string';

                setCellValueSafe(worksheet, targetCell, colVal, colType);
                populatedCellRefs.add(targetCell);
                populatedCellsCount++;
              }
            });
          });
        }
        continue;
      }

      // B. Date Input Type (e.g. 'D6,D7,D8' or 'D10,D11,D12')
      if (inputType === 'date') {
        const dateObj = parseDateParts(rawAnswer);
        if (dateObj) {
          const cells = cellRefRaw.split(',').map(s => s.trim()).filter(Boolean);
          if (cells.length >= 3) {
            // Year -> cells[0], Month -> cells[1], Day -> cells[2]
            if (dateObj.year) {
              setCellValueSafe(worksheet, cells[0], dateObj.year, 'number');
              populatedCellRefs.add(cells[0]);
              populatedCellsCount++;
            }
            if (dateObj.month) {
              setCellValueSafe(worksheet, cells[1], dateObj.month, 'number');
              populatedCellRefs.add(cells[1]);
              populatedCellsCount++;
            }
            if (dateObj.day) {
              setCellValueSafe(worksheet, cells[2], dateObj.day, 'number');
              populatedCellRefs.add(cells[2]);
              populatedCellsCount++;
            }
          } else if (cells.length === 1) {
            setCellValueSafe(worksheet, cells[0], rawAnswer, 'string');
            populatedCellRefs.add(cells[0]);
            populatedCellsCount++;
          }
        }
        continue;
      }

      // C. Dropdown with Value Input (e.g. 'D4,E4' where D4 is dropdown, E4 is custom text)
      if (hasValueInput && cellRefRaw.includes(',')) {
        const cells = cellRefRaw.split(',').map(s => s.trim()).filter(Boolean);
        const parsed = safeParseJson(rawAnswer, null);
        if (parsed && typeof parsed === 'object') {
          if (cells[0] && parsed.dropdown !== undefined && parsed.dropdown !== null && parsed.dropdown !== '') {
            setCellValueSafe(worksheet, cells[0], parsed.dropdown, 'string');
            populatedCellRefs.add(cells[0]);
            populatedCellsCount++;
          }
          if (cells[1] && parsed.custom !== undefined && parsed.custom !== null && parsed.custom !== '') {
            setCellValueSafe(worksheet, cells[1], parsed.custom, 'string');
            populatedCellRefs.add(cells[1]);
            populatedCellsCount++;
          }
        } else if (typeof rawAnswer === 'string') {
          setCellValueSafe(worksheet, cells[0], rawAnswer, 'string');
          populatedCellRefs.add(cells[0]);
          populatedCellsCount++;
        }
        continue;
      }

      // D. Multi-row List (allow_multiple === 1)
      if (allowMultiple) {
        const parsedList = safeParseJson(rawAnswer, null);
        let items = [];
        if (Array.isArray(parsedList)) {
          items = parsedList.map(it => (typeof it === 'object' && it ? (it.dropdown || it.custom || it.value || JSON.stringify(it)) : String(it || ''))).filter(s => s.trim() !== '');
        } else if (typeof rawAnswer === 'string') {
          items = rawAnswer.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
        }

        const startAddr = parseCellAddress(cellRefRaw);
        if (startAddr && items.length > 0) {
          items.forEach((itemVal, idx) => {
            const currentCell = `${startAddr.col}${startAddr.row + idx}`;
            setCellValueSafe(worksheet, currentCell, itemVal, inputType);
            populatedCellRefs.add(currentCell);
            populatedCellsCount++;
          });
        } else if (startAddr && items.length === 0 && rawAnswer) {
          setCellValueSafe(worksheet, cellRefRaw, rawAnswer, inputType);
          populatedCellRefs.add(cellRefRaw);
          populatedCellsCount++;
        }
        continue;
      }

      // E. Standard Single Cell Value (string, number, boolean, dropdown, url)
      if (cellRefRaw) {
        setCellValueSafe(worksheet, cellRefRaw, rawAnswer, inputType);
        populatedCellRefs.add(cellRefRaw);
        populatedCellsCount++;
      }
    }

    // 7b. Fallback: Process any remaining answers in answersMap that specify excel_cell_ref directly
    for (const [key, resp] of Object.entries(answersMap)) {
      if (!resp || !resp.excel_cell_ref) continue;
      const cellRefRaw = resp.excel_cell_ref.trim();
      if (!cellRefRaw) continue;

      const worksheet = findWorksheet(workbook, resp.sheet_name);
      if (!worksheet) continue;

      const rawAnswer = resp.answer_val;
      if (rawAnswer === null || rawAnswer === undefined || rawAnswer === '') continue;

      // Handle split dropdown (e.g. 'D4,E4')
      if (cellRefRaw.includes(',')) {
        const cells = cellRefRaw.split(',').map(s => s.trim()).filter(Boolean);
        const parsed = safeParseJson(rawAnswer, null);
        if (parsed && typeof parsed === 'object') {
          if (cells[0] && !populatedCellRefs.has(cells[0]) && parsed.dropdown) {
            setCellValueSafe(worksheet, cells[0], parsed.dropdown, 'string');
            populatedCellRefs.add(cells[0]);
            populatedCellsCount++;
          }
          if (cells[1] && !populatedCellRefs.has(cells[1]) && parsed.custom) {
            setCellValueSafe(worksheet, cells[1], parsed.custom, 'string');
            populatedCellRefs.add(cells[1]);
            populatedCellsCount++;
          }
        }
      } else if (!populatedCellRefs.has(cellRefRaw)) {
        // Safety check: Never dump raw JSON table strings or arrays into single cells during fallback
        const strVal = String(rawAnswer).trim();
        if (strVal.startsWith('[') || strVal.startsWith('{')) {
          continue;
        }
        setCellValueSafe(worksheet, cellRefRaw, rawAnswer, 'string');
        populatedCellRefs.add(cellRefRaw);
        populatedCellsCount++;
      }
    }

    // 7c. Clean all formula cells to prevent ExcelJS from writing <v>NaN</v> or Invalid Date in XML
    const genWs = workbook.getWorksheet('General Information') || findWorksheet(workbook, 'General Information');
    if (genWs) {
      const computeDateCell = (yearCell, monthCell, dayCell, targetCell, defaultMonth = 1, defaultDay = 1) => {
        try {
          let y = genWs.getCell(yearCell).value;
          let m = genWs.getCell(monthCell).value;
          let d = genWs.getCell(dayCell).value;
          const target = genWs.getCell(targetCell);
          const formula = (target.value && typeof target.value === 'object' && target.value.formula) ? target.value.formula : undefined;

          // Parse numeric values
          const numY = y && !isNaN(Number(y)) ? parseInt(y, 10) : null;
          const numM = m && !isNaN(Number(m)) ? parseInt(m, 10) : null;
          const numD = d && !isNaN(Number(d)) ? parseInt(d, 10) : null;

          const currentYear = new Date().getFullYear();
          const finalY = numY || currentYear;
          const finalM = numM || defaultMonth;
          const finalD = numD || defaultDay;

          // Ensure D6/D7/D8 or D10/D11/D12 contain valid numbers
          genWs.getCell(yearCell).value = finalY;
          genWs.getCell(monthCell).value = finalM;
          genWs.getCell(dayCell).value = finalD;

          // Formatted ISO date string YYYY-MM-DD
          const formatted = `${finalY}-${String(finalM).padStart(2, '0')}-${String(finalD).padStart(2, '0')}`;
          target.value = formula ? { formula, result: formatted } : formatted;
        } catch (e) {
          console.warn(`Error computing ${targetCell}:`, e.message);
        }
      };

      // D9: Reporting period start date (default Jan 1)
      computeDateCell('D6', 'D7', 'D8', 'D9', 1, 1);
      // D13: Reporting period end date (default Dec 31)
      computeDateCell('D10', 'D11', 'D12', 'D13', 12, 31);

      // Comparative period (only set if comparative year is specified)
      const compY = genWs.getCell('E6').value;
      if (compY && !isNaN(Number(compY))) {
        computeDateCell('E6', 'E7', 'E8', 'E9', 1, 1);
        computeDateCell('E10', 'E11', 'E12', 'E13', 12, 31);
      }
    }

    // 7d. Process Classified / Sensitive / Omitted Disclosures
    try {
      const [templateLabels] = await promiseDb.query(
        `SELECT l.id, l.name_en, l.category_id, c.name_en AS cat_name_en
         FROM md_vsme_lables l
         JOIN md_vsme_categories c ON l.category_id = c.id
         WHERE c.template_id = ?`,
        [targetTemplateId]
      );

      const omittedLabelsList = [];
      (templateLabels || []).forEach(lbl => {
        if (classifiedSections[lbl.id] || classifiedSections[String(lbl.id)]) {
          omittedLabelsList.push(lbl);
        }
      });

      const wsToc = workbook.getWorksheet('Table of Contents & Validation');
      const wsTech = workbook.getWorksheet('Technical Sheet');
      const wsGen = workbook.getWorksheet('General Information') || findWorksheet(workbook, 'General Information');

      if (omittedLabelsList.length > 0) {
        let omittedCount = 0;
        const matchedOmittedTitles = [];

        // 1. Update Table of Contents & Validation sheet and Technical Sheet
        if (wsToc) {
          for (let r = 5; r <= 70; r++) {
            const bCell = wsToc.getCell(`B${r}`);
            const bVal = bCell.value;
            const bTitle = String(typeof bVal === 'object' && bVal ? (bVal.result || bVal.formula || '') : (bVal || '')).trim();
            const bStr = bTitle.toLowerCase();
            if (!bStr) continue;

            const matchedLabel = omittedLabelsList.find(lbl => {
              const rawName = String(lbl.name_en || '');
              const cleanName = rawName
                .replace(/from\s*\{from date\}.*/i, '')
                .replace(/\{from date\}/gi, '')
                .replace(/\{to date\}/gi, '')
                .replace(/\[if applicable\]/gi, '')
                .trim()
                .toLowerCase();
              if (!cleanName) return false;
              return bStr.includes(cleanName) || cleanName.includes(bStr);
            });

            if (matchedLabel) {
              omittedCount++;
              matchedOmittedTitles.push(bTitle);
              wsToc.getCell(`D${r}`).value = true;

              const cVal = wsToc.getCell(`C${r}`).value;
              const eVal = wsToc.getCell(`E${r}`).value;
              const cText = "Information on sensitive information before converting";
              const eText = "This disclosure has been omitted as it contains confidential or sensitive information.";

              wsToc.getCell(`C${r}`).value = (cVal && typeof cVal === 'object' && cVal.formula) ? { formula: cVal.formula, result: cText } : cText;
              wsToc.getCell(`E${r}`).value = (eVal && typeof eVal === 'object' && eVal.formula) ? { formula: eVal.formula, result: eText } : eText;

              // Update corresponding row in Technical Sheet (row r + 188)
              if (wsTech) {
                const techRow = r + 188;
                const techCell = wsTech.getCell(`E${techRow}`);
                const techForm = (techCell.value && typeof techCell.value === 'object' && techCell.value.formula) ? techCell.value.formula : undefined;
                wsTech.getCell(`E${techRow}`).value = techForm ? { formula: techForm, result: omittedCount } : omittedCount;
              }
            }
          }
        }

        // Update Technical Sheet E259 formula count result with actual matched omitted count
        if (wsTech) {
          const e259Cell = wsTech.getCell('E259');
          const e259Form = (e259Cell.value && typeof e259Cell.value === 'object' && e259Cell.value.formula) ? e259Cell.value.formula : 'SUM(E193:E258)';
          wsTech.getCell('E259').value = { formula: e259Form, result: omittedCount };
        }

        // 2. Populate General Information sheet cells E126:E132
        if (wsGen) {
          for (let i = 0; i < 7; i++) {
            const rowNum = 126 + i;
            const eCell = wsGen.getCell(`E${rowNum}`);
            const eForm = (eCell.value && typeof eCell.value === 'object' && eCell.value.formula) ? eCell.value.formula :
              (i === 0 ? `IF('Technical Sheet'!E259=0,"None",_xlfn.XLOOKUP('Technical Sheet'!A120, 'Technical Sheet'!E193:$E$258, 'Table of Contents & Validation'!B5:$B$70, ""))` :
              `_xlfn.XLOOKUP('Technical Sheet'!A${120 + i}, 'Technical Sheet'!E${193 + i}:$E$258, 'Table of Contents & Validation'!B${5 + i}:$B$70, "")`);

            if (i < matchedOmittedTitles.length) {
              const labelName = matchedOmittedTitles[i];

              const cCell = wsGen.getCell(`C${rowNum}`);
              const dCell = wsGen.getCell(`D${rowNum}`);
              const cForm = (cCell.value && typeof cCell.value === 'object' && cCell.value.formula) ? cCell.value.formula : undefined;
              const dForm = (dCell.value && typeof dCell.value === 'object' && dCell.value.formula) ? dCell.value.formula : undefined;

              if (cForm) cCell.value = { formula: cForm, result: labelName };
              else cCell.value = labelName;

              if (dForm) dCell.value = { formula: dForm, result: labelName };
              else dCell.value = labelName;

              eCell.value = { formula: eForm, result: labelName };
              populatedCellRefs.add(`E${rowNum}`);
              populatedCellsCount++;
            } else {
              if (i === 0) {
                eCell.value = { formula: eForm, result: "None" };
              } else {
                eCell.value = { formula: eForm, result: "" };
              }
            }
          }
        }
      } else {
        // No omitted labels: ensure E259 is 0, E126 is "None", and E127-E132 are ""
        if (wsTech) {
          const e259Cell = wsTech.getCell('E259');
          const e259Form = (e259Cell.value && typeof e259Cell.value === 'object' && e259Cell.value.formula) ? e259Cell.value.formula : 'SUM(E193:E258)';
          wsTech.getCell('E259').value = { formula: e259Form, result: 0 };
        }
        if (wsGen) {
          const e126 = wsGen.getCell('E126');
          const f126 = (e126.value && typeof e126.value === 'object' && e126.value.formula) ? e126.value.formula : 'IF(\'Technical Sheet\'!E259=0,"None",_xlfn.XLOOKUP(\'Technical Sheet\'!A120, \'Technical Sheet\'!E193:$E$258, \'Table of Contents & Validation\'!B5:$B$70, ""))';
          e126.value = { formula: f126, result: "None" };

          for (let i = 1; i < 7; i++) {
            const rowNum = 126 + i;
            const eCell = wsGen.getCell(`E${rowNum}`);
            const f = (eCell.value && typeof eCell.value === 'object' && eCell.value.formula) ? eCell.value.formula : undefined;
            if (f) eCell.value = { formula: f, result: "" };
            else eCell.value = "";
          }
        }
      }
    } catch (e) {
      console.warn('Error processing classified disclosures in ExcelService:', e.message);
    }

    // Sanitize all formula cell results across all worksheets
    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          if (cell.value && typeof cell.value === 'object' && cell.value.formula) {
            const res = cell.value.result;
            if (res instanceof Date && isNaN(res.getTime())) {
              cell.value = { formula: cell.value.formula, result: '-' };
            } else if (typeof res === 'number' && isNaN(res)) {
              cell.value = { formula: cell.value.formula, result: 0 };
            } else if (res === undefined || res === null || String(res) === 'NaN') {
              cell.value = { formula: cell.value.formula, result: '' };
            }
          }
        });
      });
    });

    // 8. Generate Output Filename & Save
    const safeClient = String(effectiveClientId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeProject = String(targetProjectId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const outputFileName = `VSME_Report_Client_${safeClient}_Project_${safeProject}_${timestamp}.xlsx`;

    const outFilePath = path.join(uploadsDir, outputFileName);
    const assetFilePath = path.join(assetsVsmeDir, outputFileName);

    // Write file to uploads/
    await workbook.xlsx.writeFile(outFilePath);

    // Also write a copy to assets/uploads/vsme/ for web static serving
    try {
      await workbook.xlsx.writeFile(assetFilePath);
    } catch (copyErr) {
      console.warn('Could not write copy to assets/uploads/vsme:', copyErr.message);
    }

    // 9. Update td_vsme_submissions record with the generated file path if project_id exists
    try {
      if (targetProjectId > 0) {
        await promiseDb.query(
          `UPDATE td_vsme_submissions 
           SET updated_at = NOW() 
           WHERE template_id = ? AND client_id = ? AND project_id = ?`,
          [targetTemplateId, effectiveClientId, targetProjectId]
        );
      }
    } catch (e) {
      console.error('Error updating submission record with excel path:', e);
    }

    const relativePath = `/uploads/vsme/${outputFileName}`;

    return {
      suc: 1,
      msg: 'VSME Digital Excel Template successfully populated and saved!',
      fileName: outputFileName,
      filePath: outFilePath,
      relativePath: relativePath,
      totalPopulated: populatedCellsCount,
      timestamp
    };
  } catch (err) {
    console.error('Error in generatePopulatedVsmeExcel:', err);
    return {
      suc: 0,
      msg: `Excel generation failed: ${err.message}`,
      fileName: null,
      filePath: null
    };
  }
};

module.exports = {
  generatePopulatedVsmeExcel,
  findWorksheet,
  setCellValueSafe,
  parseCellAddress,
  parseDateParts
};
