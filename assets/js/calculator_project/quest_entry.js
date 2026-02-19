/**
 * Quest Entry Handler for ESG Risk Viewer
 * Manages dynamic loading, calculation, and saving of GHG emission questions.
 */

const QuestHandler = {
    init: function () {
        if ($('#sope-tab li').length > 0) {
            $($('#sope-tab li')[0]).children('a.nav-link').click();
        }

        // Global Enter key handler for PPT navigation
        $(document).on('keydown', (e) => {
            if (e.key === 'Enter') {
                const $activeInput = $(document.activeElement);
                if ($activeInput.hasClass('ppt-input') || $activeInput.hasClass('ppt-select') || $activeInput.parent().hasClass('select2-container')) {
                    const $nextBtn = $activeInput.closest('.question-box').find('.btn-next-ppt');
                    if ($nextBtn.length > 0 && !$nextBtn.is(':disabled')) {
                        $nextBtn.click();
                        e.preventDefault();
                    }
                }
            }
        });
    },

    /**
     * Handles visibility and navigation for question steps.
     */
    handleClickAction: async function (e) {
        const $el = $(e);
        const isBtn = $el.attr('type') ? true : false;
        const $parent = $el.parent().parent();
        const $grandParent = $parent.parent();
        const txt = $el.text().trim();
        const isNo = ['No', 'Non', 'Non '].includes(txt);
        const currentAns = $el.parent().prev().find('span.cust-badge-quest-txt').text().trim();

        // Handle Animations for non-save clicks (Cancel/Same Value)
        const hideButtonsShowBadge = () => {
            $el.parent().addClass('bounceOutLeft animated');
            $el.parent().prev().find('.badge').addClass('bounceInRight animated').show();
            setTimeout(() => {
                $el.parent().hide().removeClass('bounceOutLeft animated');
                $el.parent().prev().find('.badge').removeClass('bounceInRight animated');
            }, 1000);
        };

        if (isBtn) {
            const isTableToggle = $el.parent().hasClass('last-emi-tab');

            // 1. If same as current, just revert UI
            if (txt === currentAns) {
                hideButtonsShowBadge();
                return;
            }

            // 2. Handle Confirmation for "No"
            if (isNo && !isTableToggle) {
                const hasChildren = $grandParent.find('.sub-parent-container, .sub-sub-section').length > 0;
                if (hasChildren) {
                    const confirmed = await inititate_sweet_conf_alert('Are you sure?', "Selecting 'No' will hide and clear all related sub-questions.");
                    if (!(confirmed > 0)) {
                        hideButtonsShowBadge();
                        return;
                    }
                }
            }

            // 3. Update Visibility Logic (Hiding/Showing Children)
            if ($parent.hasClass('parent-quest')) {
                if (['Yes', 'Oui'].includes(txt)) {
                    $grandParent.find('.sub-parent-container, .sub-parent-quest').show();
                } else {
                    const $sub = $grandParent.find('.sub-parent-container, .sub-parent-quest');
                    $sub.hide().find('input').val('');
                    $sub.find('select').val('').trigger('change');
                    $sub.find('.cust-badge-quest').hide().find('.cust-badge-quest-txt').text('');
                    $sub.find('.quest-opt-btn').show();
                    $grandParent.find('.sub-sub-section').hide().children().hide();
                }
            }

            if ($parent.hasClass('sub-parent-quest')) {
                const $subSub = $parent.next('.sub-sub-section');
                if (['Yes', 'Oui'].includes(txt)) {
                    $subSub.children().each(function () {
                        const $dt = $(this);
                        if ($dt.find('.quest-opt-btn input, .quest-opt-btn select, .quest-opt-btn button').length > 0) {
                            $dt.show();
                        } else {
                            return false;
                        }
                    });
                } else {
                    $subSub.hide().children().hide();
                    $subSub.find('input').val('');
                    $subSub.find('select').val('').trigger('change');
                    $subSub.find('.cust-badge-quest').hide().find('.cust-badge-quest-txt').text('');
                    $subSub.find('.quest-opt-btn').show();
                }
            }

            // 4. Handle Last Tab Visibility & Table Sync
            if ($el.parent().hasClass('last-emi-tab')) {
                const $table = $el.parent().next();
                $table.show();
                const divId = $el.parent().attr('id').split('-').pop();
                this.syncProvisionTable(divId, ['Yes', 'Oui'].includes(txt));
            }

            // 5. Save and Finish Animations
            const $badge = $el.parent().prev().find('span.cust-badge-quest-txt');
            $badge.text(txt);
            $el.parent().addClass('bounceOutLeft animated');
            $el.parent().prev().find('.badge').addClass('bounceInRight animated').show();

            try {
                await this.saveSimpleData($el.attr('quest-dt'), txt);

                // Show next sibling question if exists (for sequential progression)
                // SUPPRESS in PPT mode as manual Next button handles this
                const $nextQuest = $parent.next();
                if ($nextQuest.hasClass('question-box') && !$parent.closest('.sub-sub-section').hasClass('ppt-wrapper')) {
                    $nextQuest.show();
                }

                if (isNo && !isTableToggle) {
                    window.location.reload();
                    return;
                }
            } catch (err) {
                console.error("Save Error:", err);
            }

            setTimeout(() => {
                $el.parent().hide().removeClass('bounceOutLeft animated');
                $el.parent().prev().find('.badge').removeClass('bounceInRight animated');
            }, 1000);
        } else {
            // Toggle view (from badge to buttons)
            const $next = $el.parent().next();
            $next.show().addClass('bounceInLeft animated');

            // Hide calculation table during selection (for last-emi-tab)
            if ($next.hasClass('last-emi-tab')) {
                $next.next().hide();
            }

            $el.addClass('bounceOutRight animated');
            setTimeout(() => {
                $el.hide();
                $next.removeClass('bounceInLeft animated');
                $el.removeClass('bounceOutRight animated');

                // If entering sub-sub-section, show only the first slide
                if ($next.hasClass('sub-parent-container')) {
                    const $slides = $next.find('.sub-sub-parent-quest');
                    $slides.hide();
                    $slides.first().show();
                }
            }, 1000);
        }
    },

    /**
     * PPT Navigation: Next Slide
     */
    nextSubSlide: function (btn, isLast) {
        const $current = $(btn).closest('.question-box');
        const $input = $current.find('input, select');

        // Validation: Ensure current VISIBLE field is filled
        let isValid = true;
        $input.each(function () {
            const $el = $(this);
            // Check if element is visible OR if it's a Select2 hidden select whose container is visible
            const isVisible = $el.is(':visible') || ($el.hasClass('custSelect2') && $el.next('.select2-container').is(':visible'));

            if ($el.prop('required') && isVisible && !$el.val()) {
                isValid = false;
                $el.addClass('is-invalid');
                // For Select2, also highlight the container
                if ($el.hasClass('custSelect2')) {
                    $el.next('.select2-container').addClass('is-invalid');
                }
                setTimeout(() => {
                    $el.removeClass('is-invalid');
                    if ($el.hasClass('custSelect2')) {
                        $el.next('.select2-container').removeClass('is-invalid');
                    }
                }, 2000);
            }
        });

        if (!isValid) return;

        if (isLast) {
            // Find the hidden original save button and trigger it
            const $saveBtn = $current.find('.legacy-save-btn');
            if ($saveBtn.length > 0) {
                $saveBtn.click();
            } else {
                // Fallback direct call if button not found by class
                const $actionDiv = $current.find('[id^="inputActionDiv-"]');
                const id = $actionDiv.attr('id').split('-').pop();
                const subSeq = $current.attr('data-sub-seq');
                this.saveCalculation(btn, id, subSeq);
            }
            return;
        }

        const $next = $current.next('.sub-sub-parent-quest');
        if ($next.length > 0) {
            $current.addClass('bounceOutLeft animated');
            setTimeout(() => {
                $current.hide().removeClass('bounceOutLeft animated');
                $next.show().addClass('bounceInRight animated');
                setTimeout(() => $next.removeClass('bounceInRight animated'), 1000);
            }, 500);
        }
    },

    /**
     * PPT Navigation: Previous Slide
     */
    prevSubSlide: function (btn) {
        const $current = $(btn).closest('.question-box');
        const $prev = $current.prev('.sub-sub-parent-quest');

        if ($prev.length > 0) {
            $current.addClass('bounceOutRight animated');
            setTimeout(() => {
                $current.hide().removeClass('bounceOutRight animated');
                $prev.show().addClass('bounceInLeft animated');
                setTimeout(() => $prev.removeClass('bounceInLeft animated'), 1000);
            }, 500);
        } else {
            // If no previous slide, show the sub-parent quest again
            const $subParent = $current.closest('.sub-parent-container').find('.sub-parent-quest');
            $current.addClass('bounceOutRight animated');
            setTimeout(() => {
                $current.hide().removeClass('bounceOutRight animated');
                $subParent.find('.badge').click(); // Re-trigger the edit mode for sub-parent
            }, 500);
        }
    },

    /**
     * AJAX: Save simple question answers.
     */
    saveSimpleData: function (quest_enc_dt, quest_ans) {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: 'POST',
                url: '/cal_quest_save',
                data: {
                    enc_dt: quest_enc_dt,
                    quest_ans,
                    sel_year: $('#sel_year_quest').val()
                },
                success: (res) => resolve(res),
                error: (err) => reject(err)
            });
        });
    },

    /**
     * AJAX: Load questions for a specific scope.
     */
    loadScopeQuestions: function (e, flag) {
        const $el = $(e);
        const tabId = $el.attr('href');
        const scope_id = $el.parent('.nav-item').attr('scope-id');
        const proj_id = $('#proj_id').val();
        const sel_year = $('#sel_year_quest').val();

        $.ajax({
            method: 'POST',
            url: '/get_question_list_by_scope_user_ajax',
            data: { scope_id, proj_id, sel_year, flag },
            dataType: 'html',
            beforeSend: () => $('.loader-wrapper').show(),
            success: (result) => {
                const res = JSON.parse(result);
                if (res.suc > 0) {
                    this.renderQuestions(tabId, res, scope_id, flag);
                }
            },
            complete: () => $('.loader-wrapper').hide()
        });
    },

    /**
     * DOM Rendering: Builds the question UI.
     */
    renderQuestions: function (tabId, res, scope_id, flag) {
        if (Object.keys(res.msg).length === 0) return;

        const $container = $(tabId).children('.quest-tab-context').empty();
        let navPills = '<div class="col-sm-3 tabs-responsive-side"><div class="nav flex-column nav-pills border-tab nav-left bounceInLeft animated" id="v-pills-tab" role="tablist" aria-orientation="vertical">';
        let tabContent = '<div class="col-sm-9"><div class="tab-content" id="v-pills-tabContent">';

        $.each(Object.keys(res.msg), (i, title) => {
            const cleanId = title.replace(/[^a-zA-Z0-9]/g, '_');
            navPills += `<a class="nav-link ${i === 0 ? 'active' : ''}" id="${cleanId}_tab" data-bs-toggle="pill" href="#${cleanId}" role="tab">${title}</a>`;
            tabContent += `<div class="tab-pane fade bounceInRight animated ${i === 0 ? 'active show' : ''}" id="${cleanId}" role="tabpanel">`;

            if (res.msg[title].length > 0) {
                tabContent += this.buildQuestionGroup(res.msg[title], res, scope_id, flag, title);
            } else {
                tabContent += '<div class="text-center"><strong class="text-danger">No Data Found</strong></div>';
            }
            tabContent += '</div>';
        });

        navPills += '</div></div>';
        tabContent += '</div></div>';
        $container.append(navPills + tabContent);

        this.initPlugins();
    },

    /**
     * Builds HTML for a group of questions.
     */
    buildQuestionGroup: function (questions, res, scope_id, flag, title) {
        let html = '';
        const parentQuests = questions.filter(q => q.is_parent === 'Y' && q.parent_id === 0);

        parentQuests.forEach(parent => {
            const qAns = res.proj_q_ans_dt.filter(a => a.quest_id === parent.id && a.end_flag !== 'Y');
            const hasAns = qAns.length > 0;
            const qSeq = `${parent.sequence}.`;

            html += `<div class="question-box parent-quest">
                ${parent.input_heading ? `<h4 class="fadeIn animated">${parent.input_heading}</h4>` : ''}
                <div class="quest-text">
                    <p class="fadeIn animated">${qSeq} &nbsp; ${parent.input_label}</p>
                    ${['R', 'C', 'S'].includes(parent.input_type) ? `<span class="badge rounded-pill badge-primary cust-badge-quest" onclick="QuestHandler.handleClickAction(this)" style="display:${hasAns ? 'block' : 'none'};"><span class="cust-badge-quest-txt m-r-10">${hasAns ? qAns[0].quest_ans : ''}</span><i class="icofont icofont-ui-edit"></i></span>` : ''}
                </div>
                <div class="quest-opt-btn mt-2" id="inputActionDiv-${parent.id}" style="display:${!hasAns ? 'block' : 'none'};">
                    ${this.createActionHtml(parent.qu_option, parent.input_type, `user_input_${parent.id}`, parent.id, parent.option_val, 0, 0, 0, scope_id, qSeq, hasAns, hasAns ? qAns[0].quest_ans : '', 0, 0, false, false, 0, parent.pro_sec_id, flag, false)}
                </div>
            </div>`;

            // Sub-parent logic
            const subParents = questions.filter(q => q.is_parent === 'N' && q.is_sub_parent === 'Y' && q.sub_parent_id === 0 && q.parent_id === parent.sequence);
            subParents.forEach(sub => {
                html += this.buildSubParentHtml(sub, questions, res, scope_id, flag, parent, title);
            });
        });

        return html;
    },

    /**
     * Builds HTML for sub-parent questions.
     */
    buildSubParentHtml: function (sub, questions, res, scope_id, flag, parent, title) {
        const subSubData = questions.filter(q => q.is_parent === 'N' && q.is_sub_parent === 'N' && q.sub_parent_id === sub.sequence && q.parent_id === parent.sequence);
        const qSeq = `${parent.sequence}.${sub.sequence}`;
        const qAns = res.proj_q_ans_dt.filter(a => a.quest_id === sub.id && a.end_flag !== 'Y');
        const hasSubAns = qAns.length > 0;
        const parentAns = res.proj_q_ans_dt.find(a => a.quest_id === parent.id && a.end_flag !== 'Y')?.quest_ans;
        const isParentYes = ['Yes', 'Oui'].includes(parentAns);

        const emiTypeQuest = subSubData.find(q => q.input_type === 'E');
        const unitQuest = subSubData.find(q => q.input_type === 'U');
        const actQuest = subSubData.find(q => q.input_type === 'A');
        const lastTabQuest = subSubData.find(q => q.next_qst_action_val === 'E');

        const accordionHtml = this.buildAccordionHtml(res, title, lastTabQuest, subSubData, qSeq);

        let html = `<div class="sub-parent-container" style="display:${isParentYes ? 'block' : 'none'};">
            <div class="question-box sub-parent-quest" style="display:${isParentYes ? 'block' : 'none'};">
                ${sub.input_heading ? `<h5 class="fadeIn animated">${sub.input_heading}</h5>` : ''}
                ${accordionHtml}
                <div class="quest-text">
                    <p class="fadeIn animated">${qSeq} &nbsp; ${sub.input_label}</p>
                    ${['R', 'C', 'S'].includes(sub.input_type) ? `<span class="badge rounded-pill badge-primary cust-badge-quest" onclick="QuestHandler.handleClickAction(this)" style="display:${hasSubAns ? 'block' : 'none'};"><span class="cust-badge-quest-txt m-r-10">${hasSubAns ? qAns[0].quest_ans : ''}</span><i class="icofont icofont-ui-edit"></i></span>` : ''}
                </div>
                <div class="quest-opt-btn mt-2" id="inputActionDiv-${sub.id}" style="display:${!hasSubAns ? 'block' : 'none'};">
                    ${this.createActionHtml(sub.qu_option, sub.input_type, `user_input_${sub.id}`, sub.id, sub.option_val, 0, 0, 0, scope_id, qSeq, hasSubAns, hasSubAns ? qAns[0].quest_ans : '', 0, 0, false, false, 0, sub.pro_sec_id, flag, false)}
                </div>
            </div>
            <div class="sub-sub-section ppt-wrapper">`;

        let hasShownFirstSlide = false;
        subSubData.forEach(ss => {
            const ssAns = res.proj_q_ans_dt.filter(a => a.quest_id === ss.id && a.end_flag !== 'Y');
            const hasSSAns = ssAns.length > 0;
            const subSubSeq = `${parent.sequence}.${sub.sequence}.${ss.sequence}`;
            const isLastEmi = ss.next_qst_action_val === 'E';
            const subParentAns = qAns[0]?.quest_ans;
            const isSubParentYes = ['Yes', 'Oui'].includes(subParentAns);

            // Slide navigation logic: Only show the first slide of the sub-sub-section initially
            const isVisible = isSubParentYes && !hasShownFirstSlide;
            if (isVisible) hasShownFirstSlide = true;

            const displayStyle = isVisible && ['R', 'C', 'S', 'I', 'A'].includes(ss.input_type) ? 'block' : 'none';

            html += `<div class="question-box sub-sub-parent-quest ppt-fade-in" style="display:${displayStyle};" data-sub-seq="${subSubSeq}">
                ${ss.input_heading ? `<h5 class="fadeIn animated">${ss.input_heading}</h5>` : ''}
                <div class="quest-text">
                    <p class="ppt-question fadeIn animated">${subSubSeq} &nbsp; ${ss.input_label}</p>
                    ${['R', 'C', 'S'].includes(ss.input_type) ? `<span class="badge rounded-pill badge-primary cust-badge-quest" onclick="QuestHandler.handleClickAction(this)" style="display:${hasSSAns ? 'block' : 'none'};"><span class="cust-badge-quest-txt m-r-10">${hasSSAns ? ssAns[0].quest_ans : ''}</span><i class="icofont icofont-ui-edit"></i></span>` : ''}
                </div>
                <div class="quest-opt-btn mt-2 ${isLastEmi ? 'last-emi-tab' : ''}" id="inputActionDiv-${ss.id}">
                    ${this.createActionHtml(ss.qu_option, ss.input_type, `user_input_${ss.id}`, ss.id, ss.option_val, emiTypeQuest?.id || 0, unitQuest?.id || 0, lastTabQuest?.id || 0, scope_id, subSubSeq, hasSSAns, hasSSAns ? ssAns[0].quest_ans : '', 0, 0, false, false, actQuest?.id || 0, ss.pro_sec_id, flag, true)}
                </div>
                ${isLastEmi ? this.createCalculationTable(ss.id, ss.emi_head_opt1, ss.emi_head_opt2, ss.emi_head_opt3, qSeq) : ''}
                
                <div class="ppt-nav">
                    <button type="button" class="btn-ppt btn-prev" onclick="QuestHandler.prevSubSlide(this)">
                        <i class="icofont icofont-arrow-left m-r-10"></i> Back
                    </button>
                    <button type="button" class="btn-ppt btn-next btn-next-ppt" onclick="QuestHandler.nextSubSlide(this, ${isLastEmi})">
                        ${isLastEmi ? 'Finish <i class="icofont icofont-check-alt m-l-10"></i>' : 'Next <i class="icofont icofont-arrow-right m-l-10"></i>'}
                    </button>
                </div>
            </div>`;
        });

        html += '</div></div>';
        return html;
    },

    /**
     * Builds the accordion for existing calculations.
     */
    buildAccordionHtml: function (res, title, lastQuest, subSubData, subParentSeq) {
        if (!lastQuest || !res.cal_val[title]) return '';

        const calData = res.cal_val[title].filter(c => c.quest_id === lastQuest.id);
        if (calData.length === 0) return '';

        const slNos = [...new Set(calData.map(c => c.sl_no))];
        let accordion = '';

        slNos.forEach(sl => {
            const filtered = calData.filter(c => c.sl_no === sl);
            const totalCo2 = filtered.reduce((acc, curr) => acc + curr.co_val, 0);
            const qAnsSec = res.quest_ans_sec[title].filter(a => a.end_flag !== 'N' && a.pro_sl_no === sl && a.quest_seq.charAt(2) === subParentSeq.charAt(2));
            const q3Ans = qAnsSec[1]?.quest_ans // qAnsSec.find(qa => qa.quest_seq.endsWith('.3') || qa.quest_seq.endsWith('.3.'))?.quest_ans || '';

            let prevDataHtml = '<div class="col-md-12">';
            let isCopied = false;

            for (const qa of qAnsSec) {
                if (qa.is_copy === 'Y') {isCopied = true; break;}
                if (qa.input_type === 'A') break;

                // Extract the sequence number part (e.g., "3" from "1.1.3")
                const seqParts = qa.quest_seq.split('.');
                const seqNum = parseInt(seqParts[seqParts.length - 1] || seqParts[seqParts.length - 2]);
                if (seqNum > 3) break;

                if (qa.input_heading) prevDataHtml += `<p class="sub-title">${qa.input_heading}</p>`;
                prevDataHtml += `<div class="figure d-block"><blockquote class="blockquote"><p class="mb-0">${qa.quest_seq} ${qa.input_label}</p></blockquote><div class="blockquote-footer">${qa.quest_ans}</div></div>`;
            }
            prevDataHtml += '</div>';

            const firstEntry = filtered[0];
            const accordionId = `accordionForIndCal${sl}-${lastQuest.id}`;

            accordion += `<div class="accordion custom-span-card" id="${accordionId}">
                <div class="accordion-item my-3 caruBackCol1">
                    <h2 class="accordion-header" id="clCalHeading${sl}-${lastQuest.id}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseColVal${sl}-${lastQuest.id}">
                            <p>${q3Ans}</p>
                            <div><span class="infoCalLeb">${firstEntry.act_name} - ${firstEntry.emi_name} - </span>&nbsp;<span class="infoCalVal">${totalCo2.toFixed(2)} tCO2e</span></div>
                        </button>
                    </h2>
                    <div id="collapseColVal${sl}-${lastQuest.id}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                        <div class="accordion-body row">
                            ${prevDataHtml}
                            <div class="col-md-12">
                                <div class="table-responsive mt-3">
                                    <table class="table table-bordered text-center">
                                        <thead><tr><th></th><th>${lastQuest.emi_head_opt1}</th><th>${lastQuest.emi_head_opt2}</th><th>${lastQuest.emi_head_opt3}</th></tr></thead>
                                        <tbody>`;

            filtered.forEach(item => {
                accordion += `<tr><td>${item.repo_mode_label}</td><td>${item.cal_val}</td><td>${item.emi_fact_val}</td><td>${item.co_val}</td></tr>`;
            });

            accordion += `</tbody><tfoot><tr><td colspan="3">Total:</td><td>${totalCo2.toFixed(2)}</td></tr></tfoot></table></div></div>`;

            if (!isCopied) {
                const editData = window.btoa(JSON.stringify({
                    cal_dt: filtered,
                    repo_mode: qAnsSec.find(q => q.quest_type === 'Y')?.quest_ans || 'Y',
                    hd1: lastQuest.emi_head_opt1.replace(/'/g, "\\'"),
                    hd2: lastQuest.emi_head_opt2.replace(/'/g, "\\'"),
                    hd3: lastQuest.emi_head_opt3.replace(/'/g, "\\'"),
                    title: `<span class="infoCalLeb">${firstEntry.act_name} - ${firstEntry.emi_name} - </span>&nbsp;<span class="infoCalVal">${totalCo2.toFixed(2)} kg CO2e </span>`
                }));
                accordion += `<div class="col-md-12 mt-3"><div class="float-end">
                    <button type="button" class="btn btn-pill btn-custom" onclick="QuestHandler.deleteRecord('${window.btoa(JSON.stringify(firstEntry))}')"><i class="icofont icofont-trash text-danger"></i></button>
                    <button type="button" class="btn btn-pill btn-custom" onclick="QuestHandler.editRecord('${editData}')"><i class="icofont icofont-pencil-alt-5 text-success"></i></button>
                </div></div>`;
            }
            accordion += '</div></div></div></div>';
        });

        return accordion;
    },

    /**
     * Creates HTML for calculation table.
     */
    createCalculationTable: function (id, th1, th2, th3, subSeq) {
        const reportingPeriod = $('#sel_year_quest').val();
        const monthOpt = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            .map(m => `<option value="${m}">${m}</option>`).join('');

        return `<div class="row" id="emiEntryTab-${id}">
            <input type="hidden" id="repo_period_${id}" name="repo_period" value="${reportingPeriod}">
            <div class="col-md-6 m-t-10">
                <label class="form-label float-start" for="strt_month_${id}">Start Month</label>
                <select class="form-select custSelect2" id="strt_month_${id}" name="strt_month" required onchange="QuestHandler.handleStartMonthChange(this, ${id})">
                    <option value="">Select Start Month</option>
                    ${monthOpt}
                </select>
            </div>
            <div class="col-md-12 mt-4 emi-table">
                <table class="table table-bordered" id="userTable${id}">
                    <thead><tr><th>Mode</th><th>${th1}</th><th>${th2}</th><th>${th3}</th></tr></thead>
                    <tbody><tr><td></td><td></td><td></td><td></td></tr></tbody>
                    <tfoot><tr><td colspan="3" class="h5">Total</td><td id="tot_emi_cal_${id}"></td></tr></tfoot>
                </table>
            </div>
            <div class="col-md-12">
                <button class="btn btn-pill btn-custom float-end legacy-save-btn" type="button" onclick="QuestHandler.saveCalculation(this, ${id}, '${subSeq}')">
                    <i class="icofont icofont-save">Save</i>
                </button>
            </div>
        </div>`;
    },

    /**
     * Creates the controls/buttons for each question type.
     */
    createActionHtml: function (option, flag, label, id, option_val, emi_id, unit_id, last_table_id, scope_id, quest_seq, hasAns, ansVal, emiVal, unitVal, hasEmiVal, hasUnitVal, act_id, quest_sec_id, globalFlag, isSubSub = false) {
        let optEle = '';
        const btnData = window.btoa(JSON.stringify({
            scope_id, quest_seq, quest_id: id, quest_type: flag,
            proj_id: $('#proj_id').val(), top_id: $('#top_id').val(),
            sec_id: $('#sec_id').val(), ind_id: $('#ind_id').val(), quest_sec_id
        }));

        switch (flag) {
            case 'R':
            case 'C':
            case 'S':
                $.each(option, (i, dt) => {
                    optEle += `<button class="btn btn-pill btn-custom m-r-40" type="button" quest-dt="${btnData}" onclick="QuestHandler.handleClickAction(this)">${dt.option_name}</button>`;
                });
                break;
            case 'I':
                optEle += `<div class="${isSubSub ? 'ppt-input-group' : ''}">
                    <input class="${isSubSub ? 'ppt-input' : 'form-control'}" id="${label}" name="${label}" type="text" value="${hasAns ? ansVal : ''}" onchange="QuestHandler.handleInputChange(this)" quest-dt="${btnData}" required placeholder="Type answer here...">
                </div>`;
                break;
            case 'A':
                this.loadActivities(option_val, globalFlag, id, emi_id, unit_id, btnData, hasAns, ansVal, emiVal, unitVal, hasEmiVal, hasUnitVal, scope_id, quest_seq, quest_sec_id, isSubSub);
                break;
            case 'Y':
                const year_opts = [{ id: 'Y', name: 'Yearly' }, { id: 'Q', name: 'Quarterly' }, { id: 'M', name: 'Monthly' }];
                optEle = `<div class="${isSubSub ? 'ppt-input-group' : 'form-group'}">
                    <select class="${isSubSub ? 'ppt-select' : 'form-select'} dynamic-sel-opt custSelect2" id="mode_type_${id}" quest-dt="${btnData}" onchange="QuestHandler.updateModeTable(this, ${id}, ${last_table_id}, ${emi_id}, ${unit_id}, '${ansVal}', ${act_id}, ${quest_sec_id})">
                        <option value="">Select Mode</option>`;
                year_opts.forEach(dt => {
                    optEle += `<option value="${dt.id}" ${hasAns && ansVal === dt.id ? 'selected' : ''}>${dt.name}</option>`;
                });
                optEle += '</select></div>';
                break;
        }
        return optEle;
    },

    /**
     * AJAX/Render: Activities for a question.
     */
    loadActivities: function (type_id, flag, id, emi_id, unit_id, btnData, hasAns, ansVal, emiVal, unitVal, hasEmiVal, hasUnitVal, scope_id, quest_seq, quest_sec_id, isSubSub = false) {
        $.ajax({
            method: 'POST',
            url: '/get_cal_act_ajax',
            data: { type_id, flag }
        }).done((result) => {
            if (result.suc > 0) {
                let opt = `<div class="${isSubSub ? 'ppt-input-group' : 'form-group'}">
                    <select class="${isSubSub ? 'ppt-select' : 'form-select'} dynamic-sel-opt custSelect2" id="act_id_${id}" data-type-id="${type_id}" next-id="${emi_id}" unit-id="${unit_id}" quest-dt="${btnData}" onchange="QuestHandler.loadEmissionTypes(this, ${hasAns ? ansVal : 0}, ${emiVal}, ${unitVal}, ${hasEmiVal}, ${hasUnitVal}, ${scope_id}, '${quest_seq}', ${quest_sec_id}, ${isSubSub})">
                        <option value="">Select Activity</option>`;
                result.msg.forEach(dt => {
                    opt += `<option value="${dt.id}" ${hasAns && dt.id == ansVal ? 'selected' : ''}>${dt.act_name}</option>`;
                });
                opt += '</select></div>';
                $(`#inputActionDiv-${id}`).append(opt);
                this.initPlugins();
                if (hasAns) $(`#act_id_${id}`).change();
            }
        });
    },

    /**
     * AJAX/Render: Emission types for an activity.
     */
    loadEmissionTypes: function (e, selVal, emiVal, unitVal, hasUnitVal, hasEmiVal, scope_id, quest_seq, quest_sec_id, isSubSub = false) {
        const $el = $(e);
        const type_id = $el.attr('data-type-id');
        const act_id = $el.val();
        const next_id = $el.attr('next-id');
        const unit_q_id = $el.attr('unit-id');
        const quest_dt = $el.attr('quest-dt');

        if (selVal != act_id) this.saveSimpleData(quest_dt, act_id);

        $.ajax({
            method: 'POST',
            url: '/get_cal_emi_type_ajax',
            data: { type_id, act_id, flag: 'E' }, // Hardcoded E as per original logic context
            success: (res) => {
                if (res.suc > 0) {
                    const btnData = window.btoa(JSON.stringify({
                        scope_id, quest_seq, quest_id: next_id, quest_type: 'E',
                        proj_id: $('#proj_id').val(), top_id: $('#top_id').val(),
                        sec_id: $('#sec_id').val(), ind_id: $('#ind_id').val(), quest_sec_id
                    }));

                    const $container = $(`#inputActionDiv-${next_id}`);
                    // Only show if NOT in PPT mode
                    if (!$container.closest('.sub-sub-section').hasClass('ppt-wrapper')) {
                        $container.parent().show();
                    }
                    $container.empty();

                    let opt = `<div class="${isSubSub ? 'ppt-input-group' : 'form-group'}">
                        <select class="${isSubSub ? 'ppt-select' : 'form-select'} dynamic-sel-opt custSelect2" id="emi_type_${next_id}" data-type-id="${type_id}" next-id="${unit_q_id}" quest-dt="${btnData}" onchange="QuestHandler.loadUnits(this, ${emiVal}, ${unitVal}, ${hasUnitVal}, ${scope_id}, '${quest_seq}', ${quest_sec_id}, ${isSubSub})">
                            <option value="">Select Emission Source</option>`;
                    res.msg.forEach(dt => {
                        opt += `<option value="${dt.id}" ${emiVal == dt.id ? 'selected' : ''}>${dt.emi_name}</option>`;
                    });
                    opt += '</select></div>';
                    $container.append(opt);
                    this.initPlugins();
                    if (selVal == act_id && act_id > 0) $(`#emi_type_${next_id}`).change();
                }
            }
        });
    },

    /**
     * AJAX/Render: Units for an emission type.
     */
    loadUnits: function (e, emiVal, unitVal, hasUnitVal, scope_id, quest_seq, quest_sec_id, isSubSub = false) {
        const $el = $(e);
        const emi_type_id = $el.val();
        const type_id = $el.attr('data-type-id');
        const next_id = $el.attr('next-id');
        const quest_dt = $el.attr('quest-dt');
        const id = $el.attr('id').split('_').pop();
        const act_id = $(`#act_id_${id}`).val();

        if (emi_type_id != emiVal) this.saveSimpleData(quest_dt, emi_type_id);

        $.ajax({
            method: 'POST',
            url: '/get_cal_unit_list_ajax',
            data: { type_id, act_id, emi_type_id, year: 0, flag: 'E' },
            success: (res) => {
                if (res.suc > 0) {
                    const btnData = window.btoa(JSON.stringify({
                        scope_id, quest_seq, quest_id: next_id, quest_type: 'U',
                        proj_id: $('#proj_id').val(), top_id: $('#top_id').val(),
                        sec_id: $('#sec_id').val(), ind_id: $('#ind_id').val(), quest_sec_id
                    }));

                    const $container = $(`#inputActionDiv-${next_id}`);
                    // Only show if NOT in PPT mode
                    if (!$container.closest('.sub-sub-section').hasClass('ppt-wrapper')) {
                        $container.parent().show();
                    }
                    $container.empty();

                    let opt = `<div class="${isSubSub ? 'ppt-input-group' : 'form-group'}">
                        <select class="${isSubSub ? 'ppt-select' : 'form-select'} dynamic-sel-opt custSelect2" id="unit_id_${next_id}" quest-dt="${btnData}" onchange="QuestHandler.handleUnitChange(this, ${unitVal})">
                            <option value="">Select Unit</option>`;
                    res.msg.forEach(dt => {
                        opt += `<option value="${dt.unit_id}" co-val="${dt.co_val}" ${unitVal == dt.unit_id ? 'selected' : ''}>${dt.unit_name}</option>`;
                    });
                    opt += '</select></div>';
                    $container.append(opt);
                    this.initPlugins();
                    if (emi_type_id == emiVal && emiVal > 0) $(`#unit_id_${next_id}`).change();
                }
            }
        });
    },

    /**
     * Handles unit selection change.
     */
    handleUnitChange: function (e, unitVal) {
        const $el = $(e);
        const val = $el.val();
        if (val != unitVal) this.saveSimpleData($el.attr('quest-dt'), val);

        // Show next sibling question if exists (Only if NOT in PPT mode)
        const $box = $el.closest('.question-box');
        const $nextQuest = $box.next();
        if ($nextQuest.hasClass('question-box') && !$box.closest('.sub-sub-section').hasClass('ppt-wrapper')) {
            $nextQuest.show();
        }
    },

    /**
     * Handles manual text input change.
     */
    handleInputChange: function (e) {
        const $el = $(e);
        const val = $el.val();
        const questDt = $el.attr('quest-dt');
        this.saveSimpleData(questDt, val);

        // Show next sibling question if exists
        const $nextQuest = $el.closest('.question-box').next();
        if ($nextQuest.hasClass('question-box')) {
            $nextQuest.show();
        }
    },

    /**
     * Updates the calculation table based on selected mode (Y/Q/M).
     */
    updateModeTable: function (e, id, lat_table_id, emi_id, unit_id, ansVal, act_id, quest_sec_id) {
        const $el = $(e);
        const flag = $el.val();
        const quest_dt = $el.attr('quest-dt');
        const $tableBody = $(`#userTable${lat_table_id} tbody`);
        const $tableCont = $(`#userTable${lat_table_id}`).parent().parent();

        if (ansVal != flag) this.saveSimpleData(quest_dt, flag);

        // Only show next if NOT in PPT mode
        if (!$el.closest('.sub-sub-section').hasClass('ppt-wrapper')) {
            $el.closest('.question-box').next().show();
        }

        $tableBody.empty();
        $(`#tot_emi_cal_${lat_table_id}`).text('');

        const colVal = $(`#unit_id_${unit_id}`).find('option:selected').attr('co-val') || 0;
        const subId = lat_table_id;

        let rows = [];
        const commonInputs = `<input type="hidden" id="mode_quest_id_${subId}" name="mode_quest_id" value="${id}">
                             <input type="hidden" id="mode_quest_val_${subId}" name="mode_quest_val" value="${flag}">
                             <input type="hidden" id="act_id_tab_${subId}" value="${act_id}">
                             <input type="hidden" id="emi_id_tab_${subId}" value="${emi_id}">
                             <input type="hidden" id="unit_id_tab_${subId}" value="${unit_id}">`;

        switch (flag) {
            case 'Y':
                $(`#strt_month_${lat_table_id}`).parent().hide().removeAttr('required');
                rows.push({ label: $('#sel_year_quest').val(), id: 1 });
                break;
            case 'Q':
                $(`#strt_month_${lat_table_id}`).parent().show();
                ['Q 1', 'Q 2', 'Q 3', 'Q 4'].forEach((m, i) => rows.push({ label: m, id: i + 1 }));
                break;
            case 'M':
                $(`#strt_month_${lat_table_id}`).parent().show();
                ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    .forEach((m, i) => rows.push({ label: m, id: i + 1 }));
                break;
        }
        let calRow = 0
        rows.forEach(r => {
            $tableBody.append(`<tr>
                <td><span id="input-mode-span-${r.id === 1 && flag === 'Y' ? subId : r.id + '-' + subId}">${r.label}</span>${r.id === 1 ? commonInputs : ''}</td>
                <td><input class="form-control" name="cal_val_${subId}" type="text" onchange="QuestHandler.calculateEmissions(this, ${subId})" ${calRow === 0 ? 'required' : ''}></td>
                <td><input class="form-control" name="emi_fact_val_${subId}" type="text" value="${colVal}" readonly></td>
                <td><input class="form-control" name="co_val_${subId}" type="text" readonly></td>
            </tr>`);
            calRow++;
        });
    },

    /**
     * Handles start month change for periodic reporting.
     */
    handleStartMonthChange: function (e, id) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const selMon = $(e).val();
        let selIndex = months.indexOf(selMon);
        const selYear = parseInt($(`#repo_period_${id}`).val());
        const $rows = $(`#userTable${id} tbody tr`);

        $(`#userTable${id}`).show();

        if ($rows.length === 4) { // Quarterly
            let quaters = [];
            let currYear = selYear;
            for (let i = 0; i < 4; i++) {
                if (selIndex >= 12) {
                    selIndex -= 12;
                    currYear++;
                }
                const suffix = currYear !== selYear ? `-${(currYear).toString().slice(-2)}` : '';
                quaters.push(`Q ${i + 1}, ${currYear}`);
                selIndex += 3;
            }
            $rows.each((i, row) => $(row).find('span').text(quaters[i]));
        } else if ($rows.length === 12) { // Monthly
            for (let i = 0; i < 12; i++) {
                const idx = (selIndex + i) % 12;
                $($rows[i]).find('span').text(months[idx]);
            }
        }
    },

    /**
     * Toggles readonly state for emission factor inputs.
     */
    syncProvisionTable: function (id, isActive) {
        $(`#userTable${id} tbody tr`).each(function () {
            const $input = $(this).find('input[name^="emi_fact_val"]');
            if (isActive) $input.removeAttr('readonly');
            else $input.attr('readonly', 'readonly');
        });
    },

    /**
     * Real-time calculation logic.
     */
    calculateEmissions: function (e, id) {
        let total = 0;
        $(e).closest('tbody').find('tr').each(function () {
            const val = parseFloat($(this).find('input[name^="cal_val"]').val()) || 0;
            const fact = parseFloat($(this).find('input[name^="emi_fact_val"]').val()) || 0;
            const co2 = (val * fact) / 1000;
            total += co2;
            $(this).find('input[name^="co_val"]').val(co2.toFixed(4));
        });
        $(`#tot_emi_cal_${id}`).text(total.toFixed(4));
    },

    /**
     * AJAX: Save the entire calculation table.
     */
    saveCalculation: async function (e, id, subSeq) {
        $(e).prop('disabled', true);
        const confirmed = await inititate_sweet_conf_alert('You are about to save this entry.', 'Once saved, you will only be able to edit the values used to calculate GHG emissions');

        if (confirmed > 0) {
            var repo_period = $(`#repo_period_${id}`).val(),
                strt_month = $(`#strt_month_${id}`).val(),
                mode_quest_id = $(`#mode_quest_id_${id}`).val(),
                mode_quest_val = $(`#mode_quest_val_${id}`).val(),
                act_id_tab = $(`#act_id_tab_${id}`).val(),
                emi_id_tab = $(`#emi_id_tab_${id}`).val(),
                unit_id_tab = $(`#unit_id_tab_${id}`).val(),
                quest_dt = $(`#mode_type_${mode_quest_id}`).attr('quest-dt'),
                cal_val = [],
                emi_fact_val = [],
                co_val = [],
                repo_mode_label = [];

            var act_id = $(`#act_id_${act_id_tab}`).val(),
                emi_id = $(`#emi_type_${emi_id_tab}`).val(),
                unit_id = $(`#unit_id_${unit_id_tab}`).val();

            $(`input[name="cal_val_${id}"]`).each(function (i, dt) {
                cal_val.push($(dt).val())
                repo_mode_label.push($(dt).parent().prev().text().trim())
            })
            $(`input[name="emi_fact_val_${id}"]`).each(function (i, dt) {
                emi_fact_val.push($(dt).val())
            })
            $(`input[name="co_val_${id}"]`).each(function (i, dt) {
                co_val.push($(dt).val())
            })

            const data = {
                enc_dt: quest_dt,
                repo_period,
                strt_month,
                cal_val: JSON.stringify(cal_val),
                emi_fact_val: JSON.stringify(emi_fact_val),
                co_val: JSON.stringify(co_val),
                mode_quest_id,
                mode_quest_val,
                quest_id: id,
                act_id,
                emi_id,
                unit_id,
                repo_mode_label: JSON.stringify(repo_mode_label),
                subSeq
            }

            $.ajax({
                method: 'POST',
                url: '/save_co_cal_ajax',
                data: data,
                success: (res) => { if (res.suc > 0) window.location.reload(); }
            })
        } else {
            $(e).prop('disabled', false);
        }
    },

    /**
     * AJAX: Delete a calculation record.
     */
    deleteRecord: async function (encDt) {
        if (await inititate_sweet_conf_alert('Are you sure?', "You won't be able to revert this!") > 0) {
            $.ajax({
                method: 'POST',
                url: '/delete_ghg_ext_cal_mod_ajax',
                data: { enc_dt: encDt },
                success: (res) => { if (res.suc > 0) window.location.reload(); }
            });
        }
    },

    /**
     * AJAX: Edit a calculation record (Show Modal).
     */
    editRecord: async function (encDt) {
        if (await inititate_sweet_conf_alert('Want to edit?', "You won't be able to revert this!") > 0) {
            $.ajax({
                method: 'POST',
                url: '/ghg_edit_cal_data_ajax',
                data: { enc_dt: encDt, flag: 0 },
                success: (res) => {
                    $(res).modal('show');
                    setTimeout(() => {
                        $('#url').val(window.location.href.split('?')[1] || '');
                    }, 1000);
                }
            });
        }
    },

    /**
     * DOM: Add a row to the manual adjustment table.
     */
    addModuleRow: function (id) {
        const $table = $(`#${id}`);
        const tot_row = $table.find('tbody tr').length;
        const emi_val = $(`#emi_fact_val_${tot_row}`).val();
        const prevMonth = $(`#repo_mode_label_${tot_row}`).val();
        const startMonth = $(`#repo_mode_label_1`).val();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sel_index = months.indexOf(prevMonth);
        const next_mon = months[(sel_index + 1) % 12];

        if (next_mon !== startMonth) {
            $table.find('tbody').append(`
                <tr>
                    <td>
                        ${next_mon}
                        <input type="hidden" id="repo_mode_label_${tot_row + 1}" name="repo_mode_label" value="${next_mon}">
                    </td>
                    <td>
                        <input class="form-control" name="cal_val" type="text" onchange="QuestHandler.calculateEmissions(this, 'Md')" required>
                    </td>
                    <td>
                        <input class="form-control" name="emi_fact_val" type="text" value="${emi_val}" readonly>
                    </td>
                    <td>
                        <input class="form-control" name="co_val" type="text" readonly>
                    </td>
                    <td>
                        <button class="btn btn-custom" type="button" onclick="QuestHandler.deleteModuleRow(this)"><i class="icofont icofont-trash"></i></button>
                    </td>
                </tr>
            `);
        } else {
            if (typeof initiate_sweet_alert === 'function') {
                initiate_sweet_alert('', 'Duplicate month found!', 'danger');
            } else {
                alert('Duplicate month found!');
            }
        }
    },

    /**
     * DOM: Delete a row from the manual adjustment table.
     */
    deleteModuleRow: async function (e) {
        if (await inititate_sweet_conf_alert('Are you sure?', "You won't be able to revert this!") > 0) {
            $(e).closest('tr').detach();
        }
    },

    /**
     * Plugins initializer.
     */
    initPlugins: function () {
        setTimeout(() => {
            $('.custSelect2').select2({
                placeholder: "-- Select an option --",
                allowClear: false,
                theme: "bootstrap-5"
            });
        }, 100);
    }
};

$(document).ready(() => QuestHandler.init());
