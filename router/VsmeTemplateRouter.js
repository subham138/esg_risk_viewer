const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const VsmeRouter = express.Router();
const { db_Select, db_Insert } = require('../modules/MasterModule');
const {
  getTemplateList,
  getDropdownGroupNames,
  getDropdownMasterFullMap,
  getTemplateHierarchy,
  saveTemplateHierarchy,
  updateTemplateHierarchy,
  getVsmeClientQuestionnaire,
  saveVsmeDraftResponses,
  submitVsmeFinalResponses,
  generatePopulatedVsmeExcel
} = require('../modules/VsmeTemplateModule');

/**
 * GET /admin/vsme-templates
 * List view of all VSME Templates (grouped by lineage showing latest version)
 */
VsmeRouter.get('/admin/vsme-templates', async (req, res) => {
  try {
    const listRes = await getTemplateList();
    const viewData = {
      header: 'VSME Templates',
      templates: listRes.suc > 0 ? listRes.data : [],
      message: req.session.message || null
    };
    res.render('vsme_templates/view', viewData);
  } catch (err) {
    console.error('Error fetching VSME template list:', err);
    req.session.message = { type: 'danger', message: 'Failed to load templates' };
    res.render('vsme_templates/view', { header: 'VSME Templates', templates: [] });
  }
});

/**
 * GET /admin/vsme-templates/create
 * Render Template Builder for creating a new template
 */
VsmeRouter.get('/admin/vsme-templates/create', async (req, res) => {
  try {
    const dropdownRes = await getDropdownGroupNames();
    const viewData = {
      header: 'VSME Template Builder',
      sub_header: 'Create New VSME Template',
      header_url: '/admin/vsme-templates',
      dropdown_groups: dropdownRes.suc > 0 ? dropdownRes.data : [],
      template: null
    };
    res.render('vsme_templates/builder', viewData);
  } catch (err) {
    console.error('Error loading template builder:', err);
    req.session.message = { type: 'danger', message: 'Error opening template builder' };
    res.redirect('/admin/vsme-templates');
  }
});

/**
 * POST /admin/vsme-templates/store
 * Create brand new VSME template atomically
 */
VsmeRouter.post('/admin/vsme-templates/store', async (req, res) => {
  try {
    const templatePayload = req.body;
    const userName = (req.session.user && req.session.user.user_name) ? req.session.user.user_name : 'Admin';

    const saveRes = await saveTemplateHierarchy(templatePayload, userName);

    if (saveRes.suc > 0) {
      req.session.message = {
        type: 'success',
        message: 'VSME Template created successfully!'
      };
      return res.json({ success: true, redirect: '/admin/vsme-templates', message: 'VSME Template created successfully!' });
    } else {
      return res.status(400).json({ success: false, message: saveRes.msg || 'Failed to create template' });
    }
  } catch (err) {
    console.error('Error in store template controller:', err);
    return res.json({ success: false, message: 'Server error while creating template' });
  }
});

/**
 * GET /admin/vsme-templates/edit/:id
 * Render Template Builder pre-populated with existing template hierarchy
 */
VsmeRouter.get('/admin/vsme-templates/edit/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templateRes = await getTemplateHierarchy(templateId);
    const dropdownRes = await getDropdownGroupNames();

    if (templateRes.suc === 0 || !templateRes.data) {
      req.session.message = { type: 'danger', message: 'Template not found' };
      return res.redirect('/admin/vsme-templates');
    }

    const viewData = {
      header: 'VSME Template Builder',
      sub_header: `Edit Template (Version ${templateRes.data.version_number})`,
      header_url: '/admin/vsme-templates',
      dropdown_groups: dropdownRes.suc > 0 ? dropdownRes.data : [],
      template: templateRes.data
    };
    res.render('vsme_templates/builder', viewData);
  } catch (err) {
    console.error('Error loading edit template page:', err);
    req.session.message = { type: 'danger', message: 'Error loading template for edit' };
    res.redirect('/admin/vsme-templates');
  }
});

/**
 * POST /admin/vsme-templates/update/:id
 * Update template with immutability protection (clones to v+1 if published or has data)
 */
VsmeRouter.post('/admin/vsme-templates/update/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const templatePayload = req.body;
    const userName = (req.session.user && req.session.user.user_name) ? req.session.user.user_name : 'Admin';

    const updateRes = await updateTemplateHierarchy(templateId, templatePayload, userName);

    if (updateRes.suc > 0) {
      req.session.message = {
        type: 'success',
        message: updateRes.msg
      };
      return res.json({ success: true, redirect: '/admin/vsme-templates', message: updateRes.msg });
    } else {
      return res.status(400).json({ success: false, message: updateRes.msg || 'Failed to update template' });
    }
  } catch (err) {
    console.error('Error in update template controller:', err);
    return res.json({ success: false, message: 'Server error while updating template' });
  }
});

/**
 * ==============================================================================
 * CLIENT QUESTIONNAIRE & RESPONSE CAPTURE CONTROLLERS (PPT SLIDE ENGINE)
 * ==============================================================================
 */

/**
 * GET /vsme/questionnaire
 * Render the modern PPT slide-style presentation questionnaire for clients
 */
VsmeRouter.get('/vsme/questionnaire', async (req, res) => {
  try {
    const templateId = req.query.template_id || req.query.id || null;
    const projectId = req.query.project_id || 0;
    const flag = req.query.flag || 'RVY%3D';
    const initialLang = req.query.lang || 'en';

    const isAdmin = (req.session.user && req.session.user.user_type === 'A');
    const safeFlag = flag.includes('%') ? flag : encodeURIComponent(flag);
    const fallbackUrl = isAdmin ? '/admin/vsme-templates' : `/my_project?flag=${safeFlag}`;

    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : '0';

    const formRes = await getVsmeClientQuestionnaire(templateId, userId, clientId, projectId);

    if (formRes.suc === 0 || !formRes.data) {
      req.session.message = { type: 'warning', message: formRes.msg || 'No active template available.' };
      return res.redirect(fallbackUrl);
    }

    let projectName = '';
    if (projectId > 0) {
      try {
        const projRes = await db_Select('project_name', 'td_project', `id = ${projectId}`, null);
        if (projRes.suc > 0 && projRes.msg.length > 0) {
          projectName = projRes.msg[0].project_name;
        }
      } catch (e) {
        console.error('Error fetching project name for VSME questionnaire:', e);
      }
    }

    const viewData = {
      header: 'VSME Sustainability Questionnaire',
      sub_header: projectName ? `Project: ${projectName}` : 'Interactive XBRL Disclosure Data Capture',
      header_url: fallbackUrl,
      formData: formRes.data,
      selected_language: initialLang,
      project_id: projectId,
      project_name: projectName,
      flag: flag,
      is_admin: isAdmin,
      user: req.session.user || { user_name: 'Client User' }
    };

    res.render('vsme_templates/client_form', viewData);
  } catch (err) {
    console.error('Error loading client VSME questionnaire:', err);
    const isAdmin = (req.session.user && req.session.user.user_type === 'A');
    req.session.message = { type: 'danger', message: 'Error opening questionnaire' };
    res.redirect(isAdmin ? '/admin/vsme-templates' : '/my_project?flag=RVY%3D');
  }
});

/**
 * POST /vsme/save-draft
 * Manual AJAX draft save endpoint
 */
VsmeRouter.post('/vsme/save-draft', async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : '0';
    const userName = (req.session.user && req.session.user.user_name) ? req.session.user.user_name : 'Client User';

    const saveRes = await saveVsmeDraftResponses(payload, userId, clientId, userName);
    if (saveRes.suc > 0) {
      return res.json({ success: true, ...saveRes });
    } else {
      return res.status(400).json({ success: false, message: saveRes.msg || 'Failed to save draft' });
    }
  } catch (err) {
    console.error('Error in save-draft controller:', err);
    return res.json({ success: false, message: 'Server error while saving draft' });
  }
});

/**
 * POST /vsme/auto-save
 * Lightweight silent background auto-save endpoint (idle & debounce)
 */
VsmeRouter.post('/vsme/auto-save', async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : '0';
    const userName = (req.session.user && req.session.user.user_name) ? req.session.user.user_name : 'Client User';

    const saveRes = await saveVsmeDraftResponses(payload, userId, clientId, userName);
    return res.json({ success: saveRes.suc > 0, ...saveRes });
  } catch (err) {
    console.error('Error in auto-save controller:', err);
    return res.json({ success: false, message: 'Silent auto-save error' });
  }
});

/**
 * POST /vsme/submit
 * Final submission endpoint (validates and locks submission and generates Excel)
 */
VsmeRouter.post('/vsme/submit', async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : '0';
    const userName = (req.session.user && req.session.user.user_name) ? req.session.user.user_name : 'Client User';

    const submitRes = await submitVsmeFinalResponses(payload, userId, clientId, userName);
    if (submitRes.suc > 0) {
      req.session.message = {
        type: 'success',
        message: 'VSME Questionnaire successfully submitted for XBRL generation!'
      };

      const isAdmin = (req.session.user && req.session.user.user_type === 'A');
      const flag = payload.flag || req.query.flag || 'RVY%3D';
      const safeFlag = flag.includes('%') ? flag : encodeURIComponent(flag);
      const redirectUrl = isAdmin ? '/admin/vsme-templates' : `/my_project?flag=${safeFlag}`;

      return res.json({
        success: true,
        redirect: redirectUrl,
        message: 'VSME Questionnaire successfully submitted!',
        excel_file: submitRes.excel_file || null,
        download_url: submitRes.download_url || null
      });
    } else {
      return res.status(400).json({ success: false, message: submitRes.msg || 'Failed to submit questionnaire' });
    }
  } catch (err) {
    console.error('Error in submit controller:', err);
    return res.json({ success: false, message: 'Server error while submitting questionnaire' });
  }
});

/**
 * GET /vsme/export-excel
 * Generate / retrieve populated VSME Digital Excel file and trigger direct download
 */
VsmeRouter.get('/vsme/export-excel', async (req, res) => {
  try {
    const templateId = parseInt(req.query.template_id || 0, 10);
    const projectId = parseInt(req.query.project_id || 0, 10);
    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : (req.query.client_id || '0');

    if (!templateId) {
      return res.status(400).send('Invalid template ID for Excel export');
    }

    const excelRes = await generatePopulatedVsmeExcel({
      templateId,
      userId,
      clientId,
      projectId
    });

    if (excelRes.suc > 0 && excelRes.filePath && fs.existsSync(excelRes.filePath)) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          fileName: excelRes.fileName,
          filePath: excelRes.filePath,
          downloadUrl: excelRes.relativePath,
          totalPopulated: excelRes.totalPopulated
        });
      }
      return res.download(excelRes.filePath, excelRes.fileName);
    } else {
      console.error('Excel generation error:', excelRes.msg);
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json({ success: false, message: excelRes.msg || 'Failed to generate Excel file' });
      }
      return res.send(excelRes.msg || 'Error generating populated Excel file');
    }
  } catch (err) {
    console.error('Error in export-excel endpoint:', err);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: false, message: 'Server error generating Excel file' });
    }
    return res.send('Server error while exporting Excel file');
  }
});

/**
 * POST /vsme/generate-excel
 * On-demand generation from current form state with live answers payload
 */
VsmeRouter.post('/vsme/generate-excel', async (req, res) => {
  try {
    const payload = req.body;
    const templateId = parseInt(payload.template_id || 0, 10);
    const projectId = parseInt(payload.project_id || 0, 10);
    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : '0';

    if (!templateId) {
      return res.status(400).json({ success: false, message: 'Invalid template ID.' });
    }

    // If answers provided in payload, first save draft so DB and session are up to date
    if (payload.answers && Object.keys(payload.answers).length > 0) {
      const userName = (req.session.user && req.session.user.user_name) ? req.session.user.user_name : 'Client User';
      await saveVsmeDraftResponses(payload, userId, clientId, userName);
    }

    const excelRes = await generatePopulatedVsmeExcel({
      templateId,
      userId,
      clientId,
      projectId,
      overrideAnswers: payload.answers || null,
      classifiedSections: payload.classified_sections || {}
    });

    if (excelRes.suc > 0) {
      return res.json({
        success: true,
        fileName: excelRes.fileName,
        downloadUrl: excelRes.relativePath,
        directUrl: `/vsme/export-excel?template_id=${templateId}&project_id=${projectId}`,
        totalPopulated: excelRes.totalPopulated,
        message: 'VSME Digital Excel file generated successfully!'
      });
    } else {
      return res.json({ success: false, message: excelRes.msg || 'Failed to generate Excel file' });
    }
  } catch (err) {
    console.error('Error in generate-excel controller:', err);
    return res.json({ success: false, message: 'Server error generating Excel file' });
  }
});

/**
 * POST /vsme/generate-xbrl
 * Full pipeline: Generate populated Excel → run Python parse-and-ixbrl.py → store HTML → update DB
 */
VsmeRouter.post('/vsme/generate-xbrl', async (req, res) => {
  try {
    const projectId = parseInt(req.body.project_id || 0, 10);
    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Invalid project ID.' });
    }

    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : '0';

    // 1. Find the template_id for this project from td_vsme_submissions
    const subRes = await db_Select(
      'template_id',
      'td_vsme_submissions',
      `project_id = ${projectId} AND client_id = '${clientId}'`,
      'ORDER BY updated_at DESC LIMIT 1'
    );

    let templateId = 0;
    if (subRes.suc > 0 && subRes.msg.length > 0) {
      templateId = subRes.msg[0].template_id;
    }

    // Fallback: get latest published or active template if no submission found
    if (!templateId) {
      const tmplRes = await db_Select(
        'id',
        'md_vsme_templates',
        null,
        'ORDER BY is_published DESC, id DESC LIMIT 1'
      );
      if (tmplRes.suc > 0 && tmplRes.msg.length > 0) {
        templateId = tmplRes.msg[0].id;
      }
    }

    if (!templateId) {
      return res.status(400).json({ success: false, message: 'No VSME template found for this project.' });
    }

    // 2. Generate the populated Excel file
    const excelRes = await generatePopulatedVsmeExcel({
      templateId,
      userId,
      clientId,
      projectId
    });

    if (excelRes.suc === 0 || !excelRes.filePath) {
      return res.json({
        success: false,
        message: excelRes.msg || 'Failed to generate populated Excel file.'
      });
    }

    console.log(`[XBRL] Excel generated: ${excelRes.filePath}`);

    // 3. Run the Python parse-and-ixbrl.py script
    const xbrlConverterPath = process.env.XBRL_CONVERTER_PATH;
    const pythonExe = process.env.XBRL_PYTHON_EXE;

    if (!xbrlConverterPath || !pythonExe) {
      return res.json({
        success: false,
        message: 'XBRL converter path not configured in .env (XBRL_CONVERTER_PATH / XBRL_PYTHON_EXE).'
      });
    }

    if (!fs.existsSync(pythonExe)) {
      return res.json({
        success: false,
        message: `Python executable not found at: ${pythonExe}`
      });
    }

    const scriptPath = path.join(xbrlConverterPath, 'scripts', 'parse-and-ixbrl.py');
    if (!fs.existsSync(scriptPath)) {
      return res.json({
        success: false,
        message: `XBRL conversion script not found at: ${scriptPath}`
      });
    }

    // Output HTML filename
    const timestamp = Date.now();
    const outputFileName = `xbrl_project_${projectId}_${timestamp}.html`;
    const xbrlDir = path.join(__dirname, '..', 'assets', 'uploads', 'xbrl');

    // Ensure directory exists
    if (!fs.existsSync(xbrlDir)) {
      fs.mkdirSync(xbrlDir, { recursive: true });
    }

    const outputFilePath = path.join(xbrlDir, outputFileName);

    // Build the command
    const cmd = `"${pythonExe}" "${scriptPath}" "${excelRes.filePath}" "${outputFilePath}" --viewer`;
    console.log(`[XBRL] Running command: ${cmd}`);

    try {
      const stdout = execSync(cmd, {
        cwd: xbrlConverterPath,
        timeout: 300000, // 5 minute timeout for Arelle validation
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`[XBRL] Script output: ${stdout}`);
    } catch (execErr) {
      console.error('[XBRL] Script execution error:', execErr.message);
      console.error('[XBRL] stderr:', execErr.stderr);
      return res.json({
        success: false,
        message: `XBRL conversion failed: ${execErr.stderr || execErr.message}`
      });
    }

    // 4. Verify output file exists
    if (!fs.existsSync(outputFilePath)) {
      return res.json({
        success: false,
        message: 'XBRL conversion completed but output HTML file was not created.'
      });
    }

    // 5. Update td_project with the xbrl_file_path
    const relativePath = `/uploads/xbrl/${outputFileName}`;
    const updateRes = await db_Insert(
      'td_project',
      `xbrl_file_path = '${relativePath}'`,
      null,
      `id = ${projectId}`,
      1
    );

    if (updateRes.suc === 0) {
      console.error('[XBRL] Failed to update td_project:', updateRes.msg);
    }

    console.log(`[XBRL] Successfully generated and stored: ${relativePath}`);

    return res.json({
      success: true,
      message: 'iXBRL report generated successfully!',
      xbrl_path: relativePath,
      fileName: outputFileName
    });

  } catch (err) {
    console.error('Error in generate-xbrl endpoint:', err);
    return res.json({
      success: false,
      message: `Server error: ${err.message}`
    });
  }
});

/**
 * GET /vsme/xbrl-preview
 * Render the XBRL preview page (shows iframe with generated HTML or generate button)
 */
VsmeRouter.get('/vsme/xbrl-preview', async (req, res) => {
  try {
    const projectId = parseInt(req.query.project_id || 0, 10);
    const flag = req.query.flag || 'RVY%3D';

    if (!projectId) {
      req.session.message = { type: 'danger', message: 'Invalid project ID.' };
      return res.redirect(`/my_project?flag=${flag}`);
    }

    // Fetch project details including xbrl_file_path
    const projRes = await db_Select(
      'id, project_name, xbrl_file_path',
      'td_project',
      `id = ${projectId}`,
      null
    );

    if (projRes.suc === 0 || projRes.msg.length === 0) {
      req.session.message = { type: 'danger', message: 'Project not found.' };
      return res.redirect(`/my_project?flag=${flag}`);
    }

    const project = projRes.msg[0];
    const safeFlag = flag.includes('%') ? flag : encodeURIComponent(flag);

    // Verify the XBRL file actually exists on disk
    let xbrlFilePath = project.xbrl_file_path || null;
    if (xbrlFilePath) {
      const fullPath = path.join(__dirname, '..', 'assets', xbrlFilePath);
      if (!fs.existsSync(fullPath)) {
        console.warn(`[XBRL] File path in DB but file missing on disk: ${fullPath}`);
        xbrlFilePath = null;
      }
    }

    const viewData = {
      header: 'iXBRL Report Preview',
      sub_header: `${project.project_name} — iXBRL Report Preview`,
      header_url: `/my_project?flag=${safeFlag}`,
      back_url: `/my_project?flag=${safeFlag}`,
      project_id: projectId,
      project_name: project.project_name,
      xbrl_file_path: xbrlFilePath,
      flag: flag
    };

    res.render('vsme_templates/xbrl_preview', viewData);
  } catch (err) {
    console.error('Error in xbrl-preview endpoint:', err);
    req.session.message = { type: 'danger', message: 'Error loading XBRL preview.' };
    const flag = req.query.flag || 'RVY%3D';
    res.redirect(`/my_project?flag=${flag}`);
  }
});

module.exports = VsmeRouter;
