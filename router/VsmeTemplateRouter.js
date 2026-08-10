const express = require('express');
const VsmeRouter = express.Router();
const {
  getTemplateList,
  getDropdownGroupNames,
  getDropdownMasterFullMap,
  getTemplateHierarchy,
  saveTemplateHierarchy,
  updateTemplateHierarchy,
  getVsmeClientQuestionnaire,
  saveVsmeDraftResponses,
  submitVsmeFinalResponses
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
    return res.status(500).json({ success: false, message: 'Server error while creating template' });
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
    return res.status(500).json({ success: false, message: 'Server error while updating template' });
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
    const initialLang = req.query.lang || 'en';

    const userId = req.session.user ? req.session.user.id || req.session.user.user_id || 0 : 0;
    const clientId = req.session.user ? req.session.user.client_id || '0' : '0';

    const formRes = await getVsmeClientQuestionnaire(templateId, userId, clientId, projectId);

    if (formRes.suc === 0 || !formRes.data) {
      req.session.message = { type: 'warning', message: formRes.msg || 'No active template available.' };
      return res.redirect('/admin/vsme-templates');
    }

    const viewData = {
      header: 'VSME Sustainability Questionnaire',
      sub_header: 'Interactive XBRL Disclosure Data Capture',
      header_url: '/admin/vsme-templates',
      formData: formRes.data,
      selected_language: initialLang,
      project_id: projectId,
      user: req.session.user || { user_name: 'Client User' }
    };

    res.render('vsme_templates/client_form', viewData);
  } catch (err) {
    console.error('Error loading client VSME questionnaire:', err);
    req.session.message = { type: 'danger', message: 'Error opening questionnaire' };
    res.redirect('/admin/vsme-templates');
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
    return res.status(500).json({ success: false, message: 'Server error while saving draft' });
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
 * Final submission endpoint (validates and locks submission)
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
      return res.json({
        success: true,
        redirect: '/admin/vsme-templates',
        message: 'VSME Questionnaire successfully submitted!'
      });
    } else {
      return res.status(400).json({ success: false, message: submitRes.msg || 'Failed to submit questionnaire' });
    }
  } catch (err) {
    console.error('Error in submit controller:', err);
    return res.status(500).json({ success: false, message: 'Server error while submitting questionnaire' });
  }
});

module.exports = VsmeRouter;

