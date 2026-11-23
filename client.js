window.__ModuleLoader__.load({
  id: 'dsh-editable-question-options',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { Fragment, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } = React;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'editable-question-options';

    // ---------------------------------------------------------------------
    // Locale dictionaries (zh is the key-set source of truth).
    // ---------------------------------------------------------------------

    const zh = {
      'option.recommended': '推荐',
      'option.edited': '已编辑',
      'option.edit': '编辑这个选项',
      'hint.options': '选中接近的选项后，点铅笔可原位微调选项文字与细节',
      'editor.label': '选项名称',
      'editor.description': '补充细节（可选）',
      'editor.save': '保存修改',
      'editor.cancel': '取消',
      'editor.reset': '恢复原选项',
      'editor.hint': '保存后会同时提交原选项与这里的修改说明，模型能看懂你在基础上做了哪些调整。',
      'editor.aria': '编辑选项 {label}',
      'custom.placeholder': '输入你的答案',
      'wait.takeTime': '慢慢回答',
      'wait.countdown': '{seconds} 秒后继续工作',
      'wait.paused': '已暂停 · 剩余 {seconds} 秒',
      'wait.held': '会一直等你回答',
      'wait.continued': '已继续工作，仍可回答',
      'nav.prev': '上一题',
      'nav.next': '下一题',
      'nav.minimize': '收起问题卡片',
      'nav.maximize': '展开问题卡片',
      'nav.cancel': '放弃整组问题',
      'nav.close': '收起问题面板，可从工具调用重新打开',
      'action.skip': '跳过',
      'action.next': '下一题',
      submit: '提交',
      submitting: '提交中',
      'error.incomplete': '请先完成这道问题。',
      'error.unanswered': '请选择一个选项或填写自定义答案。',
      'error.unavailable': '当前无法提交，请稍候再试。',
      'error.resubmit': '回答未送达，工作已继续，请再提交一次。',
      'status.sent': '回答已发送；面板未能关闭。',
      'submit.editedOption': '选项「{original}」修改为：{label}',
      'submit.editedOptionWithDescription': '选项「{original}」修改为：{label}（{description}）',
      'fallback.title': '问题卡片渲染出错',
      'fallback.body': '可以跳过这道问题让模型继续，或收起面板后从工具调用重新打开。',
      'fallback.skip': '跳过并继续',
      'fallback.hide': '收起面板',
      'fallback.busy': '提交中',
    };

    const en = {
      'option.recommended': 'Recommended',
      'option.edited': 'Edited',
      'option.edit': 'Edit this option',
      'hint.options': 'Pick the closest option, then use the pencil to fine-tune its text and details in place.',
      'editor.label': 'Option label',
      'editor.description': 'Details (optional)',
      'editor.save': 'Save changes',
      'editor.cancel': 'Cancel',
      'editor.reset': 'Restore original',
      'editor.hint': 'Submitting keeps the original option selected and sends your revision as a note, so the model knows what you adjusted.',
      'editor.aria': 'Edit option {label}',
      'custom.placeholder': 'Type your answer',
      'wait.takeTime': 'Take time',
      'wait.countdown': 'Continuing in {seconds}s',
      'wait.paused': 'Paused · {seconds}s remaining',
      'wait.held': 'Waiting until you answer',
      'wait.continued': 'Work continued — you can still answer',
      'nav.prev': 'Previous question',
      'nav.next': 'Next question',
      'nav.minimize': 'Collapse the question card',
      'nav.maximize': 'Expand the question card',
      'nav.cancel': 'Dismiss all questions',
      'nav.close': 'Close the panel — reopen it from the tool call',
      'action.skip': 'Skip',
      'action.next': 'Next',
      submit: 'Submit',
      submitting: 'Submitting',
      'error.incomplete': 'Please complete this question first.',
      'error.unanswered': 'Please select an option or enter a custom answer.',
      'error.unavailable': 'Cannot submit right now; try again in a moment.',
      'error.resubmit': 'The answer did not arrive before work continued; submit it again.',
      'status.sent': 'Reply sent; the panel could not close.',
      'submit.editedOption': 'Option "{original}" edited to: {label}',
      'submit.editedOptionWithDescription': 'Option "{original}" edited to: {label} ({description})',
      'fallback.title': 'The question card failed to render',
      'fallback.body': 'Skip this question so the model can continue, or close the panel and reopen it from the tool call.',
      'fallback.skip': 'Skip and continue',
      'fallback.hide': 'Close panel',
      'fallback.busy': 'Submitting',
    };

    // ---------------------------------------------------------------------
    // Styles
    // ---------------------------------------------------------------------

    const CSS = `
.eqo-frame{padding:6px calc(var(--dsh-composer-side-clearance, 0px) + 16px) 10px;display:flex;justify-content:center}
.eqo-card{box-sizing:border-box;display:flex;flex-direction:column;width:100%;max-width:var(--dsh-chat-content-width, 780px);max-height:min(62vh, 560px);overflow:hidden;padding:0 0 10px;border:0;border-radius:var(--dsw-radius-xl, 16px);background:var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-1, #ffffff));color:var(--dsw-alias-label-primary, #111111);box-shadow:var(--dsw-elevation-panel, 0 8px 28px rgba(0,0,0,.16));font-size:14px;line-height:22px}
.eqo-card,.eqo-card *{box-sizing:border-box}
.eqo-cardMinimized{max-height:none}
.eqo-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-shrink:0;padding:18px 14px 0 22px}
.eqo-headingBlock{min-width:0}
.eqo-eyebrow{margin-bottom:4px;color:var(--dsw-alias-label-secondary, #666666);font-size:11px;line-height:16px}
.eqo-title{margin:0;font-size:16px;font-weight:500;line-height:22px;overflow-wrap:anywhere}
.eqo-headerActions{display:flex;align-items:center;gap:4px;flex-shrink:0}
.eqo-waitStatus{color:var(--dsw-alias-label-secondary, #666666);font-size:12px;line-height:24px;white-space:nowrap}
.eqo-waitButton{white-space:nowrap;padding:2px 10px;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.35));border-radius:999px;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:20px;cursor:pointer}
.eqo-waitButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1))}
.eqo-iconButton{display:grid;place-items:center;width:26px;height:26px;padding:0;border:0;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary, #666666);cursor:pointer}
.eqo-iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1));color:var(--dsw-alias-label-primary, #111111)}
.eqo-iconButton:disabled{opacity:.4;cursor:default}
.eqo-body{flex:auto;min-height:0;padding:8px 20px 4px 22px;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:8px}
.eqo-detail{margin:0 2px 6px;color:var(--dsw-alias-label-secondary, #555555);font-size:13px;line-height:21px;white-space:pre-wrap;overflow-wrap:anywhere}
.eqo-hint{margin:0 2px 6px;color:var(--dsw-alias-label-secondary, #666666);font-size:12px;line-height:18px}
.eqo-options{display:flex;flex-direction:column;gap:6px}
.eqo-optionBlock{border:1px solid transparent;border-radius:12px;background:transparent;transition:background .12s ease,border-color .12s ease}
.eqo-optionBlockSelected{background:color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb)) 8%, transparent);border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb)) 32%, transparent)}
.eqo-optionBlockEditing{border-color:var(--dsw-alias-border-l2, rgba(127,127,127,.35));background:var(--dsw-alias-bg-layer-2, rgba(127,127,127,.06))}
.eqo-optionRow{display:flex;align-items:flex-start;gap:2px;position:relative}
.eqo-option{flex:1 1 auto;display:flex;align-items:flex-start;gap:10px;min-width:0;padding:9px 10px;border:0;border-radius:12px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.eqo-option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.08))}
.eqo-option:disabled{opacity:.6;cursor:default}
.eqo-option:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb));outline-offset:1px}
.eqo-number{flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:999px;background:var(--dsw-alias-bg-layer-2, rgba(127,127,127,.12));color:var(--dsw-alias-label-secondary, #666666);font-size:12px}
.eqo-optionBlockSelected .eqo-number{background:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb));color:#ffffff}
.eqo-checkbox{flex:none;display:grid;place-items:center;width:16px;height:16px;margin-top:3px;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.5));border-radius:5px;color:#ffffff}
.eqo-checkboxChecked{border-color:transparent;background:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb))}
.eqo-optionCopy{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
.eqo-optionLine{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;min-width:0}
.eqo-optionLabel{min-width:0;overflow-wrap:anywhere}
.eqo-badge{flex:none;padding:0 6px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb)) 12%, transparent);color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb));font-size:11px;line-height:17px}
.eqo-badgeEdited{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 16%, transparent);color:var(--dsw-alias-state-warn-primary, #b45309)}
.eqo-description{flex-basis:100%;color:var(--dsw-alias-label-secondary, #666666);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.eqo-editButton{flex:none;display:grid;place-items:center;width:28px;height:28px;margin:7px 6px 0 0;padding:0;border:0;border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary, #777777);opacity:.75;cursor:pointer}
.eqo-editButton:hover:not(:disabled){opacity:1;background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1));color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb))}
.eqo-editButton:disabled{opacity:.35;cursor:default}
.eqo-editor{display:flex;flex-direction:column;gap:8px;margin:0 10px 8px 10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.2));border-radius:10px;background:var(--dsw-alias-bg-layer-1, rgba(127,127,127,.05))}
.eqo-editorField{display:flex;flex-direction:column;gap:4px}
.eqo-editorLabel{color:var(--dsw-alias-label-secondary, #666666);font-size:12px;line-height:16px}
.eqo-input,.eqo-textarea{width:100%;padding:6px 9px;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.35));border-radius:8px;background:var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-1, #ffffff));color:inherit;font:inherit;font-size:13px;line-height:20px;resize:vertical;outline:none}
.eqo-textarea{min-height:52px}
.eqo-input:focus,.eqo-textarea:focus{border-color:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb));box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb)) 18%, transparent)}
.eqo-editorActions{display:flex;align-items:center;gap:8px}
.eqo-spacer{flex:1}
.eqo-editorHint{margin:0;color:var(--dsw-alias-label-secondary, #666666);font-size:11px;line-height:16px}
.eqo-linkBtn{padding:2px 6px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary, #666666);font:inherit;font-size:12px;text-decoration:underline;cursor:pointer}
.eqo-linkBtn:hover:not(:disabled){color:var(--dsw-alias-state-error-primary, #cc0000)}
.eqo-customRow{display:flex;align-items:flex-start;gap:10px;margin-top:2px;padding:7px 10px;border:1px dashed var(--dsw-alias-border-l2, rgba(127,127,127,.35));border-radius:12px}
.eqo-customRowActive{border-style:solid;border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb)) 36%, transparent)}
.eqo-answerField{flex:1 1 auto;width:100%;min-width:0;max-height:160px;padding:2px 0;border:0;background:transparent;color:inherit;font:inherit;font-size:14px;line-height:22px;resize:none;outline:none}
.eqo-answerField::placeholder{color:var(--dsw-alias-label-secondary, #999999)}
.eqo-answerBlock{margin-top:2px;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3));border-radius:12px}
.eqo-footer{display:flex;flex-wrap:wrap;align-items:center;gap:10px;flex-shrink:0;padding:8px 20px 2px 20px}
.eqo-pager{display:flex;align-items:center;gap:4px}
.eqo-progress{padding:0 4px;color:var(--dsw-alias-label-secondary, #666666);font-size:13px;line-height:24px;white-space:nowrap}
.eqo-feedback{flex:1 1 120px;min-width:0;color:var(--dsw-alias-state-error-primary, #cc0000);font-size:11px;line-height:16px}
.eqo-actions{display:flex;align-items:center;gap:8px;margin-left:auto}
.eqo-btn{padding:4px 12px;border:1px solid transparent;border-radius:999px;font:inherit;font-size:13px;line-height:20px;cursor:pointer}
.eqo-btn:disabled{opacity:.5;cursor:default}
.eqo-btnGhost{border-color:var(--dsw-alias-border-l2, rgba(127,127,127,.35));background:transparent;color:inherit}
.eqo-btnGhost:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1))}
.eqo-btnPrimary{background:var(--dsw-alias-state-business-primary, var(--dsw-alias-brand-primary, #1f6feb));color:#ffffff}
.eqo-btnPrimary:hover:not(:disabled){filter:brightness(1.06)}
@media (max-width:720px){.eqo-header{padding:16px 12px 0 16px}.eqo-body{padding:8px 14px 4px 16px}.eqo-footer{padding:8px 14px 2px 14px}}
`;

    // ---------------------------------------------------------------------
    // Icons
    // ---------------------------------------------------------------------

    function iconFrame(size, children) {
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        'aria-hidden': 'true',
        focusable: 'false',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }, children);
    }

    const IconPencil = ({ size = 14 }) => iconFrame(size, [
      h('path', { key: 'body', d: 'M11.4 2.6l2 2-8.2 8.2-2.6.6.6-2.6 8.2-8.2z' }),
      h('path', { key: 'tip', d: 'M10 4l2 2' }),
    ]);
    const IconCheck = ({ size = 12 }) => iconFrame(size, [h('path', { key: 'check', d: 'M3 8.5l3.2 3.2L13 4.8' })]);
    const IconChevronDown = ({ size = 16 }) => iconFrame(size, [h('path', { key: 'down', d: 'M4 6l4 4 4-4' })]);
    const IconChevronUp = ({ size = 16 }) => iconFrame(size, [h('path', { key: 'up', d: 'M4 10l4-4 4 4' })]);
    const IconChevronLeft = ({ size = 16 }) => iconFrame(size, [h('path', { key: 'left', d: 'M10 3L5 8l5 5' })]);
    const IconChevronRight = ({ size = 16 }) => iconFrame(size, [h('path', { key: 'right', d: 'M6 3l5 5-5 5' })]);
    const IconClose = ({ size = 16 }) => iconFrame(size, [
      h('path', { key: 'a', d: 'M4 4l8 8' }),
      h('path', { key: 'b', d: 'M12 4l-8 8' }),
    ]);

    // ---------------------------------------------------------------------
    // Pure helpers
    // ---------------------------------------------------------------------

    const RECOMMENDED_SUFFIX = /\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*$/i;

    /**
     * Split the conventional recommendation suffix without changing the answer value.
     * @param label - original option label.
     * @returns display label plus recommendation state.
     */
    function parseRecommendedLabel(label) {
      const text = typeof label === 'string' ? label : '';
      return RECOMMENDED_SUFFIX.test(text)
        ? { label: text.replace(RECOMMENDED_SUFFIX, ''), recommended: true }
        : { label: text, recommended: false };
    }

    /** Marked first choice becomes a draft selection; the user still submits it. */
    function recommendedFirstOption(question) {
      const first = question && Array.isArray(question.options) ? question.options[0] : undefined;
      if (first === undefined || typeof first.label !== 'string') return undefined;
      return parseRecommendedLabel(first.label).recommended ? first.label : undefined;
    }

    /** Fresh per-question draft. */
    function initialDraft(question) {
      const recommended = recommendedFirstOption(question);
      return {
        selected: recommended === undefined ? [] : [recommended],
        custom: '',
        skipped: false,
        edits: {},
      };
    }

    /** Whether the user has answered this question at all. */
    function isAnswered(draft) {
      return draft.selected.length > 0 || draft.custom.trim() !== '';
    }

    /** Whether the question may be submitted (answer or explicit skip). */
    function isCompleted(draft) {
      return draft.skipped || isAnswered(draft);
    }

    /** Render one model-facing revision line for an edited option. */
    function formatEditedOption(original, edit, t) {
      const label = edit.label.trim();
      const description = (edit.description === undefined ? '' : edit.description).trim();
      return description === ''
        ? t('submit.editedOption', { original: original.label, label })
        : t('submit.editedOptionWithDescription', { original: original.label, label, description });
    }

    /**
     * Build the answer batch from drafts.
     *
     * A selected option keeps its ORIGINAL label in `selected` so the model can
     * see the base choice; every revision of that option is appended to the
     * question's single `custom` note. A free-text-only single-select answer
     * keeps the shipped exclusive behavior (empty `selected`).
     *
     * @param questions - request questions.
     * @param drafts - per-question drafts.
     * @param t - bound translator.
     * @returns the answer batch handed to the pending question.
     */
    function buildAnswerBatch(questions, drafts, t) {
      return {
        answers: questions.map((question, questionIndex) => {
          const draft = drafts[questionIndex];
          if (draft.skipped) return { id: question.id, selected: [] };
          const options = Array.isArray(question.options) ? question.options : [];
          const optionByLabel = new Map(options.map((option) => [option.label, option]));
          const chosen = draft.selected.filter((label) => optionByLabel.has(label));
          const editLines = [];
          for (const label of chosen) {
            const edit = draft.edits[label];
            if (edit === undefined) continue;
            editLines.push(formatEditedOption(optionByLabel.get(label), edit, t));
          }
          const free = draft.custom.trim();
          const custom = [...editLines, ...(free === '' ? [] : [free])].join('\n');
          const freeTextOnly = free !== '' && editLines.length === 0 && question.multiSelect !== true;
          const selected = freeTextOnly ? [] : chosen;
          return Object.assign({ id: question.id, selected }, custom === '' ? {} : { custom });
        }),
      };
    }

    /** Selector guard: only generic, live questions that actually offer options. */
    function isEditableQuestion(pending) {
      if (typeof pending !== 'object' || pending === null) return false;
      if (pending.kind !== 'question') return false;
      if (pending.review !== undefined) return false;
      if (!Array.isArray(pending.questions) || pending.questions.length === 0) return false;
      if (typeof pending.answer !== 'function') return false;
      if (typeof pending.snapshot !== 'function' || typeof pending.subscribe !== 'function') return false;
      return pending.questions.some((question) => question !== null
        && typeof question === 'object'
        && Array.isArray(question.options)
        && question.options.length > 0);
    }

    /** Human text of an unknown failure. */
    function errorText(cause) {
      return cause instanceof Error ? cause.message : String(cause);
    }

    /** Event-time IME guard for text fields. */
    function isComposing(event) {
      return event.nativeEvent.isComposing || Reflect.get(event.nativeEvent, 'keyCode') === 229;
    }

    // ---------------------------------------------------------------------
    // Small controls
    // ---------------------------------------------------------------------

    /** Auto-growing textarea used for the custom answer. */
    function AnswerField({ variant, value, placeholder, disabled, autoFocus, onChange, onKeyDown }) {
      const ref = useRef(null);
      useLayoutEffect(() => {
        const node = ref.current;
        if (node === null) return;
        node.style.height = 'auto';
        node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
      }, [value]);
      return h('textarea', {
        ref,
        className: `eqo-answerField eqo-answerField-${variant}`,
        value,
        rows: 1,
        placeholder,
        disabled,
        autoFocus,
        onChange,
        onKeyDown,
      });
    }

    /** Inline editor for one option's label and description. */
    function OptionEditor({ initialLabel, initialDescription, canReset, disabled, t, onSave, onCancel, onReset }) {
      const [label, setLabel] = useState(initialLabel);
      const [description, setDescription] = useState(initialDescription);
      const labelRef = useRef(null);
      const firstRender = useRef(true);
      useLayoutEffect(() => {
        if (!firstRender.current) return;
        firstRender.current = false;
        const node = labelRef.current;
        if (node === null) return;
        node.focus();
        node.select();
      }, []);
      const save = () => {
        if (label.trim() === '') return;
        onSave({ label, description });
      };
      const onLabelKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
          return;
        }
        if (event.key !== 'Enter' || event.shiftKey || isComposing(event)) return;
        event.preventDefault();
        save();
      };
      const onDescriptionKeyDown = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onCancel();
          return;
        }
        if (event.key !== 'Enter' || (!event.ctrlKey && !event.metaKey)) return;
        event.preventDefault();
        save();
      };
      return h('div', { className: 'eqo-editor' },
        h('label', { className: 'eqo-editorField' },
          h('span', { className: 'eqo-editorLabel' }, t('editor.label')),
          h('input', {
            ref: labelRef,
            className: 'eqo-input',
            value: label,
            disabled,
            onChange: (event) => setLabel(event.target.value),
            onKeyDown: onLabelKeyDown,
          })
        ),
        h('label', { className: 'eqo-editorField' },
          h('span', { className: 'eqo-editorLabel' }, t('editor.description')),
          h('textarea', {
            className: 'eqo-textarea',
            rows: 2,
            value: description,
            disabled,
            onChange: (event) => setDescription(event.target.value),
            onKeyDown: onDescriptionKeyDown,
          })
        ),
        h('div', { className: 'eqo-editorActions' },
          h('button', {
            type: 'button',
            className: 'eqo-linkBtn',
            disabled: disabled || !canReset,
            onClick: onReset,
          }, t('editor.reset')),
          h('span', { className: 'eqo-spacer' }),
          h('button', {
            type: 'button',
            className: 'eqo-btn eqo-btnGhost',
            disabled,
            onClick: onCancel,
          }, t('editor.cancel')),
          h('button', {
            type: 'button',
            className: 'eqo-btn eqo-btnPrimary',
            disabled: disabled || label.trim() === '',
            onClick: save,
          }, t('editor.save'))
        ),
        h('p', { className: 'eqo-editorHint' }, t('editor.hint'))
      );
    }

    // ---------------------------------------------------------------------
    // Crash fallback
    // ---------------------------------------------------------------------

    /** Contain one bad render without stranding the pending request. */
    class CardErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }
      static getDerivedStateFromError() {
        return { failed: true };
      }
      componentDidCatch(error, info) {
        console.error('[editable-question-options] question card crashed:', error, info);
      }
      render() {
        return this.state.failed ? this.props.fallback : this.props.children;
      }
    }

    /** Minimal answerable surface when the rich card cannot render. */
    function CrashFallback({ pending, t }) {
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState(null);
      const skipAll = () => {
        if (busy) return;
        setBusy(true);
        setError(null);
        const batch = {
          answers: pending.questions.map((question) => ({ id: question.id, selected: [] })),
        };
        pending.answer(batch).then(() => {
          if (pending.snapshot().channel !== 'rpc') return;
          pending.dismiss().catch(() => setError(t('status.sent')));
          setBusy(false);
        }).catch((cause) => {
          setBusy(false);
          setError(errorText(cause));
        });
      };
      const hide = () => {
        pending.dismiss().catch((cause) => setError(errorText(cause)));
      };
      return h('div', { className: 'eqo-frame' },
        h('section', { className: 'eqo-card', role: 'alert' },
          h('div', { className: 'eqo-header' },
            h('div', { className: 'eqo-headingBlock' },
              h('div', { className: 'eqo-eyebrow' }, t('fallback.title')),
              h('h2', { className: 'eqo-title' }, t('fallback.body'))
            )
          ),
          h('div', { className: 'eqo-footer' },
            h('div', { className: 'eqo-feedback', role: 'status' }, error),
            h('div', { className: 'eqo-actions' },
              h('button', { type: 'button', className: 'eqo-btn eqo-btnGhost', disabled: busy, onClick: hide }, t('fallback.hide')),
              h('button', { type: 'button', className: 'eqo-btn eqo-btnPrimary', disabled: busy, onClick: skipAll }, busy ? t('fallback.busy') : t('fallback.skip'))
            )
          )
        )
      );
    }

    // ---------------------------------------------------------------------
    // Question card
    // ---------------------------------------------------------------------

    function QuestionCard({ pending, t }) {
      const questions = pending.questions;
      const [drafts, setDrafts] = useState(() => questions.map(initialDraft));
      const [index, setIndex] = useState(0);
      const [busy, setBusy] = useState(null);
      const [error, setError] = useState(null);
      const [minimized, setMinimized] = useState(false);
      const [editing, setEditing] = useState(null);
      const answerSurface = useRef(null);
      const sentVia = useRef(null);
      const card = useSyncExternalStore(pending.subscribe, pending.snapshot, pending.snapshot);
      const canSubmit = card.channel !== 'none';
      const locked = busy !== null;

      const safeIndex = Math.min(index, questions.length - 1);
      const question = questions[safeIndex];
      const draft = drafts[safeIndex];
      const options = Array.isArray(question.options) ? question.options : [];
      const hasOptions = options.length > 0;
      const multiSelect = question.multiSelect === true;
      const countdown = card.countdown;
      const showCountdown = countdown !== undefined
        && card.waitState !== 'waiting'
        && card.waitState !== 'editing'
        && card.waitState !== 'continued';

      // A waterfall answer that lands after the Host continued the work can be
      // resubmitted through the Remote path, exactly like the shipped card.
      useEffect(() => {
        if (sentVia.current !== 'waterfall' || card.state !== 'continued') return;
        sentVia.current = null;
        setBusy(null);
        setError({ key: 'error.resubmit' });
      }, [card.state]);

      // Focus holds a pristine countdown, blur resumes it; hidden pages release it.
      useEffect(() => {
        const release = () => pending.releaseFocus();
        const refocus = () => {
          if (answerSurface.current !== null && answerSurface.current.contains(document.activeElement)) pending.holdFocus();
        };
        const visibilityChanged = () => {
          if (document.hidden) release();
          else refocus();
        };
        window.addEventListener('blur', release);
        window.addEventListener('focus', refocus);
        document.addEventListener('visibilitychange', visibilityChanged);
        return () => {
          release();
          window.removeEventListener('blur', release);
          window.removeEventListener('focus', refocus);
          document.removeEventListener('visibilitychange', visibilityChanged);
        };
      }, [pending]);

      const updateDraft = (updater, nextIndex = safeIndex) => {
        pending.engage();
        setDrafts((current) => current.map((item, itemIndex) => (itemIndex === safeIndex ? updater(item) : item)));
        if (nextIndex !== safeIndex) setIndex(nextIndex);
        setError(null);
      };

      const choose = (label) => {
        updateDraft((current) => {
          if (multiSelect) {
            const selected = current.selected.includes(label)
              ? current.selected.filter((item) => item !== label)
              : [...current.selected, label];
            return Object.assign({}, current, { selected, skipped: false });
          }
          return { selected: [label], custom: '', skipped: false, edits: current.edits };
        }, !multiSelect && safeIndex < questions.length - 1 ? safeIndex + 1 : safeIndex);
      };

      const draftCustom = (value) => {
        updateDraft((current) => Object.assign({}, current, {
          selected: multiSelect ? current.selected : [],
          custom: value,
          skipped: false,
        }));
      };

      const saveEdit = (option, next) => {
        const label = next.label.trim();
        if (label === '') return;
        const description = (next.description === undefined ? '' : next.description).trim();
        const originalDescription = (option.description === undefined ? '' : option.description).trim();
        updateDraft((current) => {
          const edits = Object.assign({}, current.edits);
          if (label === option.label && description === originalDescription) delete edits[option.label];
          else edits[option.label] = Object.assign({ label }, description === '' ? {} : { description });
          const selected = multiSelect
            ? (current.selected.includes(option.label) ? current.selected : [...current.selected, option.label])
            : [option.label];
          return Object.assign({}, current, { edits, selected, skipped: false });
        });
        setEditing(null);
      };

      const resetEdit = (label) => {
        updateDraft((current) => {
          const edits = Object.assign({}, current.edits);
          delete edits[label];
          return Object.assign({}, current, { edits });
        });
      };

      const submitDrafts = (values) => {
        if (locked) return;
        const missing = values.findIndex((item) => !isCompleted(item));
        if (missing >= 0) {
          setIndex(missing);
          setError({ key: 'error.incomplete' });
          return;
        }
        if (!canSubmit) {
          setError({ key: 'error.unavailable' });
          return;
        }
        const channel = pending.snapshot().channel;
        sentVia.current = channel === 'waterfall' ? 'waterfall' : null;
        setBusy('answer');
        setError(null);
        pending.answer(buildAnswerBatch(questions, values, t)).then(() => {
          if (channel !== 'rpc') return;
          sentVia.current = null;
          setBusy(null);
          setError(null);
          pending.dismiss().catch(() => setError({ key: 'status.sent' }));
        }).catch((cause) => {
          sentVia.current = null;
          setBusy(null);
          setError({ text: errorText(cause) });
        });
      };

      const continueFlow = () => {
        if (!isAnswered(draft)) {
          setError({ key: 'error.unanswered' });
          return;
        }
        if (safeIndex < questions.length - 1) {
          setIndex(safeIndex + 1);
          setError(null);
          return;
        }
        submitDrafts(drafts);
      };

      const skipQuestion = () => {
        pending.engage();
        const next = drafts.map((item, itemIndex) => (itemIndex === safeIndex
          ? { selected: [], custom: '', skipped: true, edits: {} }
          : item));
        setDrafts(next);
        setError(null);
        if (safeIndex < questions.length - 1) {
          setIndex(safeIndex + 1);
          return;
        }
        submitDrafts(next);
      };

      const takeTime = () => {
        pending.takeTime();
        setError(null);
      };

      const dismissFlow = () => {
        if (pending.dismissal === 'hide') {
          pending.dismiss().catch((cause) => setError({ text: errorText(cause) }));
          return;
        }
        if (!canSubmit) {
          setError({ key: 'error.unavailable' });
          return;
        }
        setBusy('cancel');
        setError(null);
        sentVia.current = 'waterfall';
        pending.dismiss().catch((cause) => {
          sentVia.current = null;
          setBusy(null);
          setError({ text: errorText(cause) });
        });
      };

      const onFocusCapture = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) pending.holdFocus();
      };
      const onBlurCapture = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) pending.releaseFocus();
      };

      const onCustomKeyDown = (event) => {
        if (event.key !== 'Enter' || event.shiftKey || isComposing(event)) return;
        event.preventDefault();
        continueFlow();
      };

      const renderOption = (option, optionIndex) => {
        const selected = draft.selected.includes(option.label);
        const display = parseRecommendedLabel(option.label);
        const edit = draft.edits[option.label];
        const shownLabel = edit === undefined ? display.label : edit.label;
        const shownDescription = edit === undefined ? option.description : edit.description;
        const isEditing = editing === option.label;
        return h('div', {
          key: `${option.label}-${String(optionIndex)}`,
          className: 'eqo-optionBlock'
            + (selected ? ' eqo-optionBlockSelected' : '')
            + (isEditing ? ' eqo-optionBlockEditing' : ''),
        },
          h('div', { className: 'eqo-optionRow' },
            h('button', {
              type: 'button',
              className: 'eqo-option',
              role: multiSelect ? 'checkbox' : 'radio',
              'aria-checked': selected,
              'aria-label': shownLabel,
              disabled: locked || isEditing,
              onClick: () => choose(option.label),
              onKeyDown: (event) => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                submitDrafts(drafts);
              },
            },
              multiSelect
                ? h('span', {
                  className: `eqo-checkbox${selected ? ' eqo-checkboxChecked' : ''}`,
                  'aria-hidden': 'true',
                }, selected ? h(IconCheck, { size: 12 }) : null)
                : h('span', { className: 'eqo-number', 'aria-hidden': 'true' }, optionIndex + 1),
              h('span', { className: 'eqo-optionCopy' },
                h('span', { className: 'eqo-optionLine' },
                  h('span', { className: 'eqo-optionLabel' }, shownLabel),
                  display.recommended && edit === undefined
                    ? h('span', { className: 'eqo-badge' }, t('option.recommended'))
                    : null,
                  edit !== undefined ? h('span', { className: 'eqo-badge eqo-badgeEdited' }, t('option.edited')) : null,
                  shownDescription !== undefined && shownDescription !== ''
                    ? h('span', { className: 'eqo-description' }, shownDescription)
                    : null
                )
              )
            ),
            h('button', {
              type: 'button',
              className: 'eqo-editButton',
              'aria-label': t('option.edit'),
              title: t('option.edit'),
              disabled: locked || isEditing,
              onClick: (event) => {
                event.stopPropagation();
                pending.engage();
                setError(null);
                setEditing(option.label);
              },
            }, h(IconPencil, { size: 14 }))
          ),
          isEditing
            ? h(OptionEditor, {
              key: option.label,
              initialLabel: shownLabel,
              initialDescription: shownDescription === undefined ? '' : shownDescription,
              canReset: edit !== undefined,
              disabled: locked,
              t,
              onSave: (value) => saveEdit(option, value),
              onCancel: () => setEditing(null),
              onReset: () => {
                resetEdit(option.label);
                setEditing(null);
              },
            })
            : null
        );
      };

      const customRow = h('div', {
        className: `eqo-customRow${draft.custom !== '' ? ' eqo-customRowActive' : ''}`,
      },
        multiSelect
          ? h('span', {
            className: `eqo-checkbox${draft.custom !== '' ? ' eqo-checkboxChecked' : ''}`,
            'aria-hidden': 'true',
          }, draft.custom !== '' ? h(IconCheck, { size: 12 }) : null)
          : h('span', { className: 'eqo-number', 'aria-hidden': 'true' }, h(IconPencil, { size: 12 })),
        h(AnswerField, {
          variant: 'inline',
          value: draft.custom,
          placeholder: t('custom.placeholder'),
          disabled: locked,
          autoFocus: false,
          onChange: (event) => draftCustom(event.target.value),
          onKeyDown: onCustomKeyDown,
        })
      );

      const blockAnswer = h('div', { className: 'eqo-answerBlock' },
        h(AnswerField, {
          variant: 'block',
          value: draft.custom,
          placeholder: t('custom.placeholder'),
          disabled: locked,
          autoFocus: canSubmit && countdown === undefined && !locked,
          onChange: (event) => draftCustom(event.target.value),
          onKeyDown: onCustomKeyDown,
        })
      );

      const titleId = `eqo-question-${pending.key}`;
      const dismissLabel = pending.dismissal === 'hide' ? t('nav.close') : t('nav.cancel');

      const header = h('header', { className: 'eqo-header' },
        h('div', { className: 'eqo-headingBlock' },
          question.header !== undefined ? h('div', { className: 'eqo-eyebrow' }, question.header) : null,
          h('h2', { className: 'eqo-title', id: titleId }, question.question)
        ),
        h('div', { className: 'eqo-headerActions' },
          showCountdown
            ? h(Fragment, null,
              h('span', { className: 'eqo-waitStatus' },
                t(countdown.running ? 'wait.countdown' : 'wait.paused', { seconds: Math.ceil(countdown.remainingMs / 1000) })),
              h('button', { type: 'button', className: 'eqo-waitButton', disabled: locked, onClick: takeTime }, t('wait.takeTime'))
            )
            : null,
          card.state === 'continued' ? h('span', { className: 'eqo-waitStatus' }, t('wait.continued')) : null,
          countdown !== undefined && (card.waitState === 'waiting' || card.waitState === 'editing')
            ? h('span', { className: 'eqo-waitStatus' }, t('wait.held'))
            : null,
          h('button', {
            type: 'button',
            className: 'eqo-iconButton',
            'aria-label': t(minimized ? 'nav.maximize' : 'nav.minimize'),
            title: t(minimized ? 'nav.maximize' : 'nav.minimize'),
            'aria-expanded': !minimized,
            disabled: locked,
            onClick: () => setMinimized((value) => !value),
          }, minimized ? h(IconChevronUp, { size: 16 }) : h(IconChevronDown, { size: 16 })),
          h('button', {
            type: 'button',
            className: 'eqo-iconButton',
            'aria-label': dismissLabel,
            title: dismissLabel,
            disabled: locked,
            onClick: dismissFlow,
          }, h(IconClose, { size: 16 }))
        )
      );

      const body = h('div', {
        ref: answerSurface,
        className: 'eqo-body',
        'data-question-scroll': true,
        onFocusCapture,
        onBlurCapture,
      },
        question.detail !== undefined && question.detail !== ''
          ? h('p', { className: 'eqo-detail' }, question.detail)
          : null,
        hasOptions ? h('p', { className: 'eqo-hint' }, t('hint.options')) : null,
        h('div', {
          className: 'eqo-options',
          role: multiSelect ? 'group' : 'radiogroup',
          'aria-labelledby': titleId,
        },
          hasOptions ? options.map(renderOption) : null,
          hasOptions ? customRow : blockAnswer
        )
      );

      const footer = h('footer', { className: 'eqo-footer' },
        h('div', { className: 'eqo-pager' },
          h('button', {
            type: 'button',
            className: 'eqo-iconButton',
            'aria-label': t('nav.prev'),
            title: t('nav.prev'),
            disabled: safeIndex === 0 || locked,
            onClick: () => {
              setIndex(safeIndex - 1);
              setError(null);
            },
          }, h(IconChevronLeft, { size: 16 })),
          h('span', { className: 'eqo-progress' }, `${safeIndex + 1} / ${questions.length}`),
          h('button', {
            type: 'button',
            className: 'eqo-iconButton',
            'aria-label': t('nav.next'),
            title: t('nav.next'),
            disabled: safeIndex === questions.length - 1 || locked,
            onClick: () => {
              setIndex(safeIndex + 1);
              setError(null);
            },
          }, h(IconChevronRight, { size: 16 }))
        ),
        h('div', { className: 'eqo-feedback', role: 'status' }, error === null ? null : ('key' in error ? t(error.key) : error.text)),
        h('div', { className: 'eqo-actions' },
          h('button', {
            type: 'button',
            className: 'eqo-btn eqo-btnGhost',
            disabled: locked,
            onClick: skipQuestion,
          }, t('action.skip')),
          h('button', {
            type: 'button',
            className: 'eqo-btn eqo-btnPrimary',
            disabled: locked || !isAnswered(draft) || (safeIndex === questions.length - 1 && !canSubmit),
            onClick: continueFlow,
          }, busy === 'answer'
            ? t('submitting')
            : safeIndex === questions.length - 1 ? t('submit') : t('action.next'))
        )
      );

      return h('div', { className: 'eqo-frame', 'data-question-key': pending.key },
        h('section', {
          className: `eqo-card${minimized ? ' eqo-cardMinimized' : ''}`,
          'aria-labelledby': titleId,
        },
          header,
          minimized ? null : h(Fragment, null, body, footer)
        )
      );
    }

    /** Top-level composer takeover entry. */
    function EditableQuestionComposer(props) {
      const pending = props.matched;
      const t = props.t;
      return h(CardErrorBoundary, {
        key: pending.key,
        fallback: h(CrashFallback, { pending, t }),
      }, h(QuestionCard, { pending, t }));
    }

    // ---------------------------------------------------------------------
    // Plugin
    // ---------------------------------------------------------------------

    /** Required Client services: Socket registry and locale dictionaries. */
    const inject = ['slots', 'locale'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'editable-question-options: dictionaries');
      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = 'dsh-editable-question-options';
        tag.dataset.pluginCss = NS;
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'editable-question-options: styles');
      ctx.slots.inject('conversation.composer', () => ctx.slots.register({
        name: 'conversation.composer',
        // Beats the shipped generic question card (priority 0) only; the
        // subagent takeover at -10 and the approval takeover at 1 keep priority.
        priority: -1,
        select: ({ pendingInteraction }) => (isEditableQuestion(pendingInteraction) ? pendingInteraction : null),
        locale: NS,
      }, EditableQuestionComposer));
    }

    // Test-only surface, invisible to the module loader and the slot renderer.
    Object.defineProperty(apply, '__test', {
      value: {
        parseRecommendedLabel,
        recommendedFirstOption,
        initialDraft,
        isEditableQuestion,
        buildAnswerBatch,
        EditableQuestionComposer,
        QuestionCard,
        CardErrorBoundary,
        CrashFallback,
        zh,
        en,
        NS,
      },
      enumerable: false,
    });

    return { inject, apply };
  },
});
