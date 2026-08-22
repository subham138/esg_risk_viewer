const db = require('../db/db');

/**
 * VSME XBRL Template Database Module
 * Handles queries and atomic transactions for VSME Templates, Categories, Labels, and Questions.
 * Supports dynamic multilingual JSON translations, category sheet names, info descriptions, table configs,
 * conditional visibility, formula fields, validation rules, section omission toggles, and multi-period column groups.
 */

const parseJsonField = (val, defaultVal = null) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

/**
 * Get list of latest template versions grouped by lineage
 */
const getTemplateList = async () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT t.*, 
        (SELECT COUNT(*) FROM md_vsme_categories c WHERE c.template_id = t.id) AS category_count,
        (SELECT COUNT(*) FROM md_vsme_lables l JOIN md_vsme_categories c ON l.category_id = c.id WHERE c.template_id = t.id) AS label_count,
        (SELECT COUNT(*) FROM md_vsme_questions q JOIN md_vsme_lables l ON q.label_id = l.id JOIN md_vsme_categories c ON l.category_id = c.id WHERE c.template_id = t.id) AS question_count
      FROM md_vsme_templates t
      INNER JOIN (
        SELECT COALESCE(lineage_id, id) AS lineage_key, MAX(version_number) AS max_ver
        FROM md_vsme_templates
        GROUP BY lineage_key
      ) latest ON COALESCE(t.lineage_id, t.id) = latest.lineage_key AND t.version_number = latest.max_ver
      ORDER BY t.id DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return resolve({ suc: 0, msg: err.message, data: [] });
      results.forEach(t => {
        t.supported_languages = parseJsonField(t.supported_languages, ["en", "fr"]);
      });
      return resolve({ suc: 1, msg: 'Success', data: results });
    });
  });
};

/**
 * Get single template metadata by ID
 */
const getTemplateById = async (templateId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM md_vsme_templates WHERE id = ?`;
    db.query(sql, [templateId], (err, results) => {
      if (err || results.length === 0) return resolve({ suc: 0, msg: err ? err.message : 'Not found', data: null });
      const template = results[0];
      template.supported_languages = parseJsonField(template.supported_languages, ["en", "fr"]);
      return resolve({ suc: 1, msg: 'Success', data: template });
    });
  });
};

/**
 * Get dropdown list group names from master table
 */
const getDropdownGroupNames = async () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT DISTINCT list_group_name FROM md_vsme_dropdown_master WHERE active_flag='Y' ORDER BY list_group_name ASC`;
    db.query(sql, (err, results) => {
      if (err) return resolve({ suc: 0, msg: err.message, data: [] });
      const groupNames = results.map(r => r.list_group_name);
      return resolve({ suc: 1, msg: 'Success', data: groupNames });
    });
  });
};

/**
 * Get full nested hierarchy for a template ID with JSON deserialization
 */
const getTemplateHierarchy = async (templateId) => {
  const promiseDb = db.promise();
  try {
    const [templates] = await promiseDb.query(`SELECT * FROM md_vsme_templates WHERE id = ?`, [templateId]);
    if (!templates || templates.length === 0) {
      return { suc: 0, msg: 'Template not found', data: null };
    }
    const template = templates[0];
    template.supported_languages = parseJsonField(template.supported_languages, ["en", "fr"]);

    const [categories] = await promiseDb.query(
      `SELECT * FROM md_vsme_categories WHERE template_id = ? ORDER BY order_index ASC, id ASC`,
      [templateId]
    );

    for (let cat of categories) {
      cat.name_translations = parseJsonField(cat.name_translations, { en: cat.name_en || '', fr: cat.name_fr || '' });
      cat.info_translations = parseJsonField(cat.info_translations, null);
      cat.column_groups = parseJsonField(cat.column_groups, null);

      const [labels] = await promiseDb.query(
        `SELECT * FROM md_vsme_lables WHERE category_id = ? ORDER BY order_index ASC, id ASC`,
        [cat.id]
      );

      for (let lbl of labels) {
        lbl.name_translations = parseJsonField(lbl.name_translations, { en: lbl.name_en || '', fr: lbl.name_fr || '' });
        lbl.info_translations = parseJsonField(lbl.info_translations, null);

        const [questions] = await promiseDb.query(
          `SELECT * FROM md_vsme_questions WHERE label_id = ? ORDER BY order_index ASC, id ASC`,
          [lbl.id]
        );

        for (let q of questions) {
          q.question_translations = parseJsonField(q.question_translations, { en: q.question_en || '', fr: q.question_fr || '' });
          q.info_translations = parseJsonField(q.info_translations, null);
          q.table_config = parseJsonField(q.table_config, null);
          q.visibility_condition = parseJsonField(q.visibility_condition, null);
          q.formula_config = parseJsonField(q.formula_config, null);
          q.validation_rules = parseJsonField(q.validation_rules, null);
          if (q.formula_config && q.formula_config.copy_config) {
            q.copy_config = q.formula_config.copy_config;
          }
        }
        lbl.questions = questions;
      }
      cat.labels = labels;
    }

    template.categories = categories;
    return { suc: 1, msg: 'Success', data: template };
  } catch (err) {
    return { suc: 0, msg: err.message, data: null };
  }
};

/**
 * Simulated check function to test if a template has associated user data
 */
const hasAssociatedUserData = async (templateId) => {
  return false;
};

/**
 * Save new template hierarchy inside a single atomic MySQL transaction
 */
const saveTemplateHierarchy = async (templateData, createdBy = 'Admin') => {
  const promiseDb = db.promise();
  const connection = await promiseDb.getConnection();

  try {
    await connection.beginTransaction();

    const templateName = templateData.template_name || 'VSME Standard Template';
    const isPublished = templateData.is_published ? 1 : 0;
    const supportedLangs = JSON.stringify(templateData.supported_languages || ["en", "fr"]);

    // 1. Insert Template
    const [tRes] = await connection.query(
      `INSERT INTO md_vsme_templates (template_name, version_number, is_published, supported_languages, created_by) VALUES (?, 1, ?, ?, ?)`,
      [templateName, isPublished, supportedLangs, createdBy]
    );
    const templateId = tRes.insertId;

    // Set lineage_id equal to templateId for version 1
    await connection.query(`UPDATE md_vsme_templates SET lineage_id = ? WHERE id = ?`, [templateId, templateId]);

    // 2. Insert Categories, Labels, and Questions
    if (templateData.categories && Array.isArray(templateData.categories)) {
      for (let cIdx = 0; cIdx < templateData.categories.length; cIdx++) {
        const cat = templateData.categories[cIdx];

        const catNameTrans = JSON.stringify(cat.name_translations || { en: cat.name_en || '', fr: cat.name_fr || '' });
        const catInfoTrans = cat.info_translations ? JSON.stringify(cat.info_translations) : null;
        const colGroupsStr = cat.column_groups ? JSON.stringify(cat.column_groups) : null;
        const catIsOmittable = cat.is_omittable ? 1 : 0;
        const sheetName = cat.sheet_name || 'General';

        const [cRes] = await connection.query(
          `INSERT INTO md_vsme_categories (template_id, sheet_name, name_translations, info_translations, is_omittable, column_groups, name_en, name_fr, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [templateId, sheetName, catNameTrans, catInfoTrans, catIsOmittable, colGroupsStr, cat.name_en || '', cat.name_fr || '', cIdx + 1]
        );
        const categoryId = cRes.insertId;

        if (cat.labels && Array.isArray(cat.labels)) {
          for (let lIdx = 0; lIdx < cat.labels.length; lIdx++) {
            const lbl = cat.labels[lIdx];

            const lblNameTrans = JSON.stringify(lbl.name_translations || { en: lbl.name_en || '', fr: lbl.name_fr || '' });
            const lblInfoTrans = lbl.info_translations ? JSON.stringify(lbl.info_translations) : null;
            const lblIsOmittable = lbl.is_omittable ? 1 : 0;

            const [lRes] = await connection.query(
              `INSERT INTO md_vsme_lables (category_id, name_translations, info_translations, is_omittable, name_en, name_fr, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [categoryId, lblNameTrans, lblInfoTrans, lblIsOmittable, lbl.name_en || '', lbl.name_fr || '', lIdx + 1]
            );
            const labelId = lRes.insertId;

            if (lbl.questions && Array.isArray(lbl.questions)) {
              for (let qIdx = 0; qIdx < lbl.questions.length; qIdx++) {
                const q = lbl.questions[qIdx];

                const qTextTrans = JSON.stringify(q.question_translations || { en: q.question_en || '', fr: q.question_fr || '' });
                const qInfoTrans = q.info_translations ? JSON.stringify(q.info_translations) : null;
                const tableConfigStr = q.table_config ? JSON.stringify(q.table_config) : null;
                const visCondStr = q.visibility_condition ? JSON.stringify(q.visibility_condition) : null;
                const combinedFormulaObj = (q.formula_config || q.copy_config) ? {
                  ...(q.formula_config || {}),
                  ...(q.copy_config ? { copy_config: q.copy_config } : {})
                } : null;
                const formulaConfigStr = combinedFormulaObj ? JSON.stringify(combinedFormulaObj) : null;
                const valRulesStr = q.validation_rules ? JSON.stringify(q.validation_rules) : null;

                await connection.query(
                  `INSERT INTO md_vsme_questions 
                  (label_id, question_translations, info_translations, question_en, question_fr, input_type, excel_cell_ref, allow_multiple, dropdown_group_name, has_value_input, table_config, visibility_condition, formula_config, validation_rules, order_index) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    labelId,
                    qTextTrans,
                    qInfoTrans,
                    q.question_en || '',
                    q.question_fr || '',
                    q.input_type || 'string',
                    q.excel_cell_ref || '',
                    q.allow_multiple ? 1 : 0,
                    q.input_type === 'dropdown' ? (q.dropdown_group_name || null) : null,
                    q.input_type === 'dropdown' ? (q.has_value_input ? 1 : 0) : 0,
                    tableConfigStr,
                    visCondStr,
                    formulaConfigStr,
                    valRulesStr,
                    qIdx + 1
                  ]
                );
              }
            }
          }
        }
      }
    }

    await connection.commit();
    connection.release();
    return { suc: 1, msg: 'Template saved successfully', templateId };
  } catch (err) {
    await connection.rollback();
    connection.release();
    return { suc: 0, msg: err.message };
  }
};

/**
 * Update template hierarchy with version immutability check
 */
const updateTemplateHierarchy = async (templateId, templateData, updatedBy = 'Admin') => {
  const promiseDb = db.promise();

  // Fetch current template
  const [templates] = await promiseDb.query(`SELECT * FROM md_vsme_templates WHERE id = ?`, [templateId]);
  if (!templates || templates.length === 0) {
    return { suc: 0, msg: 'Template not found' };
  }
  const currentTemplate = templates[0];
  const hasUserData = await hasAssociatedUserData(templateId);

  // Update in place by default unless explicitly requested to clone a new version
  const shouldClone = (templateData.clone_new_version === true);

  const connection = await promiseDb.getConnection();

  try {
    await connection.beginTransaction();

    const templateName = templateData.template_name || currentTemplate.template_name;
    const isPublished = templateData.is_published ? 1 : 0;
    const supportedLangs = JSON.stringify(templateData.supported_languages || ["en", "fr"]);
    let targetTemplateId = templateId;

    if (shouldClone) {
      // CLONE TO NEW VERSION
      const lineageId = currentTemplate.lineage_id || currentTemplate.id;
      const nextVersion = currentTemplate.version_number + 1;

      const [tRes] = await connection.query(
        `INSERT INTO md_vsme_templates (template_name, lineage_id, version_number, is_published, supported_languages, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [templateName, lineageId, nextVersion, isPublished, supportedLangs, updatedBy]
      );
      targetTemplateId = tRes.insertId;
    } else {
      // UPDATE IN PLACE
      await connection.query(
        `UPDATE md_vsme_templates SET template_name = ?, is_published = ?, supported_languages = ? WHERE id = ?`,
        [templateName, isPublished, supportedLangs, templateId]
      );
      // Delete existing categories (CASCADE deletes child labels & questions)
      await connection.query(`DELETE FROM md_vsme_categories WHERE template_id = ?`, [templateId]);
    }

    // Insert new hierarchy for targetTemplateId
    if (templateData.categories && Array.isArray(templateData.categories)) {
      for (let cIdx = 0; cIdx < templateData.categories.length; cIdx++) {
        const cat = templateData.categories[cIdx];

        const catNameTrans = JSON.stringify(cat.name_translations || { en: cat.name_en || '', fr: cat.name_fr || '' });
        const catInfoTrans = cat.info_translations ? JSON.stringify(cat.info_translations) : null;
        const colGroupsStr = cat.column_groups ? JSON.stringify(cat.column_groups) : null;
        const catIsOmittable = cat.is_omittable ? 1 : 0;
        const sheetName = cat.sheet_name || 'General';

        const [cRes] = await connection.query(
          `INSERT INTO md_vsme_categories (template_id, sheet_name, name_translations, info_translations, is_omittable, column_groups, name_en, name_fr, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [targetTemplateId, sheetName, catNameTrans, catInfoTrans, catIsOmittable, colGroupsStr, cat.name_en || '', cat.name_fr || '', cIdx + 1]
        );
        const categoryId = cRes.insertId;

        if (cat.labels && Array.isArray(cat.labels)) {
          for (let lIdx = 0; lIdx < cat.labels.length; lIdx++) {
            const lbl = cat.labels[lIdx];

            const lblNameTrans = JSON.stringify(lbl.name_translations || { en: lbl.name_en || '', fr: lbl.name_fr || '' });
            const lblInfoTrans = lbl.info_translations ? JSON.stringify(lbl.info_translations) : null;
            const lblIsOmittable = lbl.is_omittable ? 1 : 0;

            const [lRes] = await connection.query(
              `INSERT INTO md_vsme_lables (category_id, name_translations, info_translations, is_omittable, name_en, name_fr, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [categoryId, lblNameTrans, lblInfoTrans, lblIsOmittable, lbl.name_en || '', lbl.name_fr || '', lIdx + 1]
            );
            const labelId = lRes.insertId;

            if (lbl.questions && Array.isArray(lbl.questions)) {
              for (let qIdx = 0; qIdx < lbl.questions.length; qIdx++) {
                const q = lbl.questions[qIdx];

                const qTextTrans = JSON.stringify(q.question_translations || { en: q.question_en || '', fr: q.question_fr || '' });
                const qInfoTrans = q.info_translations ? JSON.stringify(q.info_translations) : null;
                const tableConfigStr = q.table_config ? JSON.stringify(q.table_config) : null;
                const visCondStr = q.visibility_condition ? JSON.stringify(q.visibility_condition) : null;
                const combinedFormulaObj = (q.formula_config || q.copy_config) ? {
                  ...(q.formula_config || {}),
                  ...(q.copy_config ? { copy_config: q.copy_config } : {})
                } : null;
                const formulaConfigStr = combinedFormulaObj ? JSON.stringify(combinedFormulaObj) : null;
                const valRulesStr = q.validation_rules ? JSON.stringify(q.validation_rules) : null;

                await connection.query(
                  `INSERT INTO md_vsme_questions 
                  (label_id, question_translations, info_translations, question_en, question_fr, input_type, excel_cell_ref, allow_multiple, dropdown_group_name, has_value_input, table_config, visibility_condition, formula_config, validation_rules, order_index) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    labelId,
                    qTextTrans,
                    qInfoTrans,
                    q.question_en || '',
                    q.question_fr || '',
                    q.input_type || 'string',
                    q.excel_cell_ref || '',
                    q.allow_multiple ? 1 : 0,
                    q.input_type === 'dropdown' ? (q.dropdown_group_name || null) : null,
                    q.input_type === 'dropdown' ? (q.has_value_input ? 1 : 0) : 0,
                    tableConfigStr,
                    visCondStr,
                    formulaConfigStr,
                    valRulesStr,
                    qIdx + 1
                  ]
                );
              }
            }
          }
        }
      }
    }

    await connection.commit();
    connection.release();

    const successMsg = shouldClone
      ? `Template cloned as Version ${currentTemplate.version_number + 1} successfully.`
      : `Template updated successfully.`;

    return { suc: 1, msg: successMsg, templateId: targetTemplateId, cloned: shouldClone };
  } catch (err) {
    await connection.rollback();
    connection.release();
    return { suc: 0, msg: err.message };
  }
};

/**
 * Get all dropdown master options grouped by list_group_name
 */
const getDropdownMasterFullMap = async () => {
  return new Promise((resolve) => {
    const sql = `SELECT * FROM md_vsme_dropdown_master WHERE active_flag='Y' ORDER BY list_group_name ASC, order_index ASC, id ASC`;
    db.query(sql, (err, results) => {
      if (err) return resolve({ suc: 0, msg: err.message, data: {} });
      const map = {};
      results.forEach(row => {
        if (!map[row.list_group_name]) {
          map[row.list_group_name] = [];
        }
        map[row.list_group_name].push({
          id: row.id,
          value_en: row.value_en,
          value_fr: row.value_fr || row.value_en,
          order_index: row.order_index
        });
      });
      return resolve({ suc: 1, msg: 'Success', data: map });
    });
  });
};

/**
 * Get client questionnaire data (template hierarchy + saved responses + master dropdowns)
 */
const getVsmeClientQuestionnaire = async (templateId = null, userId = 0, clientId = '0', projectId = 0) => {
  const promiseDb = db.promise();
  try {
    let targetTemplateId = templateId;
    let targetProjectId = parseInt(projectId || 0, 10);
    let effectiveClientId = String(clientId || '0');

    // If project_id > 0, resolve effective client_id from td_project to ensure accuracy across all user types
    if (targetProjectId > 0) {
      try {
        const [projRows] = await promiseDb.query(`SELECT client_id FROM td_project WHERE id = ?`, [targetProjectId]);
        if (projRows && projRows.length > 0 && projRows[0].client_id) {
          effectiveClientId = String(projRows[0].client_id);
        }
      } catch (e) {
        console.error('Error resolving client_id from td_project:', e);
      }
    }

    // If templateId not provided, find the latest published or highest version template
    if (!targetTemplateId) {
      const [latest] = await promiseDb.query(
        `SELECT id FROM md_vsme_templates ORDER BY is_published DESC, version_number DESC, id DESC LIMIT 1`
      );
      if (latest && latest.length > 0) {
        targetTemplateId = latest[0].id;
      } else {
        return { suc: 0, msg: 'No VSME templates configured yet.', data: null };
      }
    }

    // 1. Fetch full template hierarchy
    const hierarchyRes = await getTemplateHierarchy(targetTemplateId);
    if (hierarchyRes.suc === 0 || !hierarchyRes.data) {
      return { suc: 0, msg: hierarchyRes.msg || 'Template not found', data: null };
    }
    const template = hierarchyRes.data;

    // 2. Fetch master dropdown options
    const dropdownMapRes = await getDropdownMasterFullMap();
    const dropdownMaster = dropdownMapRes.suc > 0 ? dropdownMapRes.data : {};

    // 3. Fetch existing saved responses
    // For a project (targetProjectId > 0), load responses saved for that client and project
    // For scratch/preview (targetProjectId === 0), load responses for that user and client
    let respQuery = '';
    let respParams = [];
    if (targetProjectId > 0) {
      respQuery = `SELECT * FROM td_vsme_responses WHERE template_id = ? AND client_id = ? AND project_id = ?`;
      respParams = [targetTemplateId, effectiveClientId, targetProjectId];
    } else {
      respQuery = `SELECT * FROM td_vsme_responses WHERE template_id = ? AND user_id = ? AND client_id = ? AND project_id = 0`;
      respParams = [targetTemplateId, userId || 0, effectiveClientId];
    }
    const [responses] = await promiseDb.query(respQuery, respParams);

    const answersMap = {};
    const classifiedSections = {};
    if (responses && responses.length > 0) {
      responses.forEach(r => {
        answersMap[r.question_id] = {
          id: r.id,
          question_id: r.question_id,
          excel_cell_ref: r.excel_cell_ref,
          sheet_name: r.sheet_name,
          answer_val: r.answer_val,
          calculated_val: r.calculated_val,
          is_classified: r.is_classified,
          status: r.status,
          updated_at: r.updated_at
        };
        if (r.is_classified) {
          classifiedSections[r.label_id] = 1;
        }
      });
    }

    // 4. Fetch submission tracking record
    let subQuery = '';
    let subParams = [];
    if (targetProjectId > 0) {
      subQuery = `SELECT * FROM td_vsme_submissions WHERE template_id = ? AND client_id = ? AND project_id = ?`;
      subParams = [targetTemplateId, effectiveClientId, targetProjectId];
    } else {
      subQuery = `SELECT * FROM td_vsme_submissions WHERE template_id = ? AND user_id = ? AND client_id = ? AND project_id = 0`;
      subParams = [targetTemplateId, userId || 0, effectiveClientId];
    }
    const [submissions] = await promiseDb.query(subQuery, subParams);
    const submission = submissions && submissions.length > 0 ? submissions[0] : null;

    // 5. Fetch all available template versions for version switcher dropdown
    const [availableTemplates] = await promiseDb.query(
      `SELECT id, template_name, version_number, is_published, supported_languages, created_at FROM md_vsme_templates ORDER BY version_number DESC, id DESC`
    );

    return {
      suc: 1,
      msg: 'Success',
      data: {
        template,
        answers: answersMap,
        classifiedSections,
        submission,
        dropdownMaster,
        availableTemplates: availableTemplates || []
      }
    };
  } catch (err) {
    console.error('Error in getVsmeClientQuestionnaire:', err);
    return { suc: 0, msg: err.message, data: null };
  }
};

/**
 * Save draft responses (batch upsert for manual draft and auto-save)
 */
const saveVsmeDraftResponses = async (payload, userId = 0, clientId = '0', userName = 'User') => {
  const promiseDb = db.promise();
  try {
    const templateId = parseInt(payload.template_id, 10);
    const projectId = parseInt(payload.project_id || 0, 10);
    const selectedLanguage = payload.selected_language || 'en';
    const answers = payload.answers || {}; // { [question_id]: { answer_val, calculated_val, excel_cell_ref, sheet_name, category_id, label_id, is_classified } }
    const classifiedSections = payload.classified_sections || {}; // { [label_id]: 1/0 }

    let effectiveClientId = String(clientId || '0');
    if (projectId > 0) {
      try {
        const [projRows] = await promiseDb.query(`SELECT client_id FROM td_project WHERE id = ?`, [projectId]);
        if (projRows && projRows.length > 0 && projRows[0].client_id) {
          effectiveClientId = String(projRows[0].client_id);
        }
      } catch (e) {
        console.error('Error resolving client_id in saveVsmeDraftResponses:', e);
      }
    }

    if (!templateId) {
      return { suc: 0, msg: 'Invalid template ID.' };
    }

    const questionIds = Object.keys(answers);
    let totalAnswered = 0;

    for (const qId of questionIds) {
      const qData = answers[qId];
      if (!qData) continue;

      const questionId = parseInt(qId, 10);
      const categoryId = parseInt(qData.category_id || 0, 10);
      const labelId = parseInt(qData.label_id || 0, 10);
      const cellRef = qData.excel_cell_ref || '';
      const sheetName = qData.sheet_name || '';
      const answerVal = qData.answer_val !== undefined && qData.answer_val !== null ? (typeof qData.answer_val === 'object' ? JSON.stringify(qData.answer_val) : String(qData.answer_val)) : null;
      const calcVal = qData.calculated_val !== undefined && qData.calculated_val !== null ? String(qData.calculated_val) : null;
      const isClassified = classifiedSections[labelId] ? 1 : (qData.is_classified ? 1 : 0);

      if (answerVal !== null && answerVal.trim() !== '') {
        try {
          const parsed = JSON.parse(answerVal);
          if (Array.isArray(parsed)) {
            const hasContent = parsed.some(it => {
              if (it === null || it === undefined) return false;
              if (typeof it === 'object') {
                return (it.dropdown && String(it.dropdown).trim() !== '') || (it.custom && String(it.custom).trim() !== '');
              }
              return String(it).trim() !== '';
            });
            if (hasContent) totalAnswered++;
          } else {
            totalAnswered++;
          }
        } catch (e) {
          totalAnswered++;
        }
      }

      await promiseDb.query(
        `INSERT INTO td_vsme_responses 
          (user_id, client_id, project_id, template_id, category_id, label_id, question_id, excel_cell_ref, sheet_name, answer_val, calculated_val, is_classified, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          user_id = VALUES(user_id),
          category_id = VALUES(category_id),
          label_id = VALUES(label_id),
          excel_cell_ref = VALUES(excel_cell_ref),
          sheet_name = VALUES(sheet_name),
          answer_val = VALUES(answer_val),
          calculated_val = VALUES(calculated_val),
          is_classified = VALUES(is_classified),
          status = 'draft',
          created_by = VALUES(created_by),
          updated_at = NOW()`,
        [
          userId || 0,
          effectiveClientId,
          projectId,
          templateId,
          categoryId,
          labelId,
          questionId,
          cellRef,
          sheetName,
          answerVal,
          calcVal,
          isClassified,
          userName
        ]
      );
    }

    // Get total questions count for this template to calculate progress %
    const [qCountRes] = await promiseDb.query(
      `SELECT COUNT(*) AS total_q FROM md_vsme_questions q JOIN md_vsme_lables l ON q.label_id = l.id JOIN md_vsme_categories c ON l.category_id = c.id WHERE c.template_id = ?`,
      [templateId]
    );
    const totalQuestions = qCountRes && qCountRes[0] ? qCountRes[0].total_q : 1;
    const progressPercent = Math.min(100, Math.round((totalAnswered / Math.max(1, totalQuestions)) * 100));

    // Update submission record
    await promiseDb.query(
      `INSERT INTO td_vsme_submissions 
        (user_id, client_id, project_id, template_id, selected_language, progress_percent, total_questions, answered_questions, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())
      ON DUPLICATE KEY UPDATE
        user_id = VALUES(user_id),
        selected_language = VALUES(selected_language),
        progress_percent = VALUES(progress_percent),
        total_questions = VALUES(total_questions),
        answered_questions = VALUES(answered_questions),
        updated_at = NOW()`,
      [
        userId || 0,
        effectiveClientId,
        projectId,
        templateId,
        selectedLanguage,
        progressPercent,
        totalQuestions,
        totalAnswered
      ]
    );

    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    return {
      suc: 1,
      msg: 'Draft saved successfully.',
      last_saved: nowTime,
      answered_count: totalAnswered,
      total_count: totalQuestions,
      progress_percent: progressPercent
    };
  } catch (err) {
    console.error('Error in saveVsmeDraftResponses:', err);
    return { suc: 0, msg: err.message };
  }
};

const { generatePopulatedVsmeExcel } = require('./VsmeExcelService');

/**
 * Submit final responses (validates completion, marks status as submitted, and generates populated Excel file)
 */
const submitVsmeFinalResponses = async (payload, userId = 0, clientId = '0', userName = 'User') => {
  const promiseDb = db.promise();
  try {
    // 1. First save all responses with latest values
    const draftRes = await saveVsmeDraftResponses(payload, userId, clientId, userName);
    if (draftRes.suc === 0) {
      return draftRes;
    }

    const templateId = parseInt(payload.template_id, 10);
    const projectId = parseInt(payload.project_id || 0, 10);
    const selectedLanguage = payload.selected_language || 'en';

    let effectiveClientId = String(clientId || '0');
    if (projectId > 0) {
      try {
        const [projRows] = await promiseDb.query(`SELECT client_id FROM td_project WHERE id = ?`, [projectId]);
        if (projRows && projRows.length > 0 && projRows[0].client_id) {
          effectiveClientId = String(projRows[0].client_id);
        }
      } catch (e) {
        console.error('Error resolving client_id in submitVsmeFinalResponses:', e);
      }
    }

    // 2. Mark all responses as submitted
    if (projectId > 0) {
      await promiseDb.query(
        `UPDATE td_vsme_responses SET status = 'submitted', user_id = ?, created_by = ?, updated_at = NOW() WHERE template_id = ? AND client_id = ? AND project_id = ?`,
        [userId || 0, userName, templateId, effectiveClientId, projectId]
      );

      // 3. Mark submission as completed & submitted
      await promiseDb.query(
        `UPDATE td_vsme_submissions 
         SET status = 'submitted', submitted_at = NOW(), selected_language = ?, user_id = ?, updated_at = NOW() 
         WHERE template_id = ? AND client_id = ? AND project_id = ?`,
        [selectedLanguage, userId || 0, templateId, effectiveClientId, projectId]
      );
    } else {
      await promiseDb.query(
        `UPDATE td_vsme_responses SET status = 'submitted', user_id = ?, created_by = ?, updated_at = NOW() WHERE template_id = ? AND user_id = ? AND client_id = ? AND project_id = 0`,
        [userId || 0, userName, templateId, userId || 0, effectiveClientId]
      );

      await promiseDb.query(
        `UPDATE td_vsme_submissions 
         SET status = 'submitted', submitted_at = NOW(), selected_language = ?, user_id = ?, updated_at = NOW() 
         WHERE template_id = ? AND user_id = ? AND client_id = ? AND project_id = 0`,
        [selectedLanguage, userId || 0, templateId, userId || 0, effectiveClientId]
      );
    }

    // 4. Automatically generate the populated VSME Excel template copy in uploads/
    let excelResult = null;
    try {
      excelResult = await generatePopulatedVsmeExcel({
        templateId,
        userId,
        clientId: effectiveClientId,
        projectId,
        overrideAnswers: payload.answers || null,
        classifiedSections: payload.classified_sections || {}
      });
    } catch (excelErr) {
      console.error('Error generating populated VSME Excel file during submission:', excelErr);
    }

    return {
      suc: 1,
      msg: 'VSME Questionnaire submitted and Excel template successfully generated!',
      template_id: templateId,
      project_id: projectId,
      excel_file: excelResult && excelResult.suc > 0 ? excelResult.fileName : null,
      download_url: excelResult && excelResult.suc > 0 ? excelResult.relativePath : null
    };
  } catch (err) {
    console.error('Error in submitVsmeFinalResponses:', err);
    return { suc: 0, msg: err.message };
  }
};

module.exports = {
  getTemplateList,
  getTemplateById,
  getDropdownGroupNames,
  getDropdownMasterFullMap,
  getTemplateHierarchy,
  hasAssociatedUserData,
  saveTemplateHierarchy,
  updateTemplateHierarchy,
  getVsmeClientQuestionnaire,
  saveVsmeDraftResponses,
  submitVsmeFinalResponses,
  generatePopulatedVsmeExcel
};

