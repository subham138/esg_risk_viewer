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
  const match = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10),
      day: parseInt(match[3], 10)
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

    // Check if value is boolean type or string boolean representation
    if (typeof rawValue === 'boolean') {
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
        cell.value = rawValue;
      }
      return;
    }

    if (inputType === 'number') {
      const numStr = strVal.replace(/,/g, '');
      const num = Number(numStr);
      if (!isNaN(num) && numStr !== '') {
        cell.value = num;
      } else {
        cell.value = rawValue;
      }
      return;
    }

    // String / URL / Dropdown
    cell.value = strVal;
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
      const computeDateCell = (yearCell, monthCell, dayCell, targetCell) => {
        try {
          const y = genWs.getCell(yearCell).value;
          const m = genWs.getCell(monthCell).value;
          const d = genWs.getCell(dayCell).value;
          const target = genWs.getCell(targetCell);
          const formula = (target.value && typeof target.value === 'object' && target.value.formula) ? target.value.formula : undefined;
          if (y && m && d && !isNaN(Number(y)) && !isNaN(Number(m)) && !isNaN(Number(d))) {
            const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            target.value = formula ? { formula, result: formatted } : formatted;
          } else if (formula) {
            target.value = { formula, result: '-' };
          }
        } catch (e) {
          console.warn(`Error computing ${targetCell}:`, e.message);
        }
      };

      computeDateCell('D6', 'D7', 'D8', 'D9');
      computeDateCell('E6', 'E7', 'E8', 'E9');
      computeDateCell('D10', 'D11', 'D12', 'D13');
      computeDateCell('E10', 'E11', 'E12', 'E13');
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
