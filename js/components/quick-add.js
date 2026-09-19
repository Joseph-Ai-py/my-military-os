import { Modal } from './modal.js';
import { Toast } from './toast.js';

import { ScheduleModule } from '../modules/schedule.js';
import { Rewards } from '../modules/rewards.js';
import { Finance } from '../modules/finance.js';
import { Study } from '../modules/study.js';
import { Tasks } from '../modules/tasks.js';

const createElement = (
    tag,
    classNames = '',
    attributes = {}
) => {
    const el = document.createElement(tag);

    if (classNames) {
        el.className = classNames;
    }

    Object.entries(attributes).forEach(
        ([key, value]) => {
            if (key === 'textContent') {
                el.textContent = value;
            } else if (key === 'value') {
                el.value = value;
            } else if (key === 'checked') {
                el.checked = Boolean(value);
            } else {
                el.setAttribute(key, value);
            }
        }
    );

    return el;
};

const createFormGroup = (
    labelText,
    inputElement
) => {
    const group = createElement(
        'div',
        'form-group'
    );

    const label = createElement(
        'label',
        'form-label',
        {
            textContent: labelText
        }
    );

    group.appendChild(label);
    group.appendChild(inputElement);

    return group;
};

const getTodayString = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
        now.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
        now.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const QuickAdd = {

    init() {
        const fab =
            document.getElementById(
                'quick-add-fab'
            );

        if (!fab) return;

        if (
            document.getElementById(
                'quick-add-menu'
            )
        ) {
            return;
        }

        const menu = createElement(
            'div',
            'quick-add-menu'
        );

        menu.id = 'quick-add-menu';

        const items = [
            {
                label: '일정',
                icon: '📅',
                action: () =>
                    this.openScheduleModal()
            },
            {
                label: '보상',
                icon: '🏆',
                action: () =>
                    this.openRewardModal()
            },
            {
                label: '거래',
                icon: '💰',
                action: () =>
                    this.openTransactionModal()
            },
            {
                label: '학습',
                icon: '📚',
                action: () =>
                    this.openStudyModal()
            },
            {
                label: '작업',
                icon: '✓',
                action: () =>
                    this.openTaskModal()
            }
        ];

        items.forEach((item) => {
            const button = createElement(
                'button',
                'quick-add-item'
            );

            button.type = 'button';

            button.appendChild(
                createElement(
                    'span',
                    '',
                    {
                        textContent: item.icon,
                        'aria-hidden': 'true'
                    }
                )
            );

            button.appendChild(
                createElement(
                    'span',
                    '',
                    {
                        textContent: item.label
                    }
                )
            );

            button.addEventListener(
                'click',
                () => {
                    this.closeMenu();
                    item.action();
                }
            );

            menu.appendChild(button);
        });

        document.body.appendChild(menu);

        fab.addEventListener(
            'click',
            (event) => {
                event.stopPropagation();

                if (
                    menu.classList.contains(
                        'active'
                    )
                ) {
                    this.closeMenu();
                } else {
                    this.openMenu();
                }
            }
        );

        document.addEventListener(
            'click',
            (event) => {
                if (
                    menu.classList.contains(
                        'active'
                    ) &&
                    !menu.contains(
                        event.target
                    ) &&
                    event.target !== fab
                ) {
                    this.closeMenu();
                }
            }
        );
    },

    openMenu() {
        const fab =
            document.getElementById(
                'quick-add-fab'
            );

        const menu =
            document.getElementById(
                'quick-add-menu'
            );

        if (!fab || !menu) return;

        fab.classList.add('active');
        menu.classList.add('active');
    },

    closeMenu() {
        const fab =
            document.getElementById(
                'quick-add-fab'
            );

        const menu =
            document.getElementById(
                'quick-add-menu'
            );

        if (!fab || !menu) return;

        fab.classList.remove('active');
        menu.classList.remove('active');
    },

    openScheduleModal() {
        const titleInput =
            createElement(
                'input',
                'input',
                {
                    type: 'text',
                    placeholder: '일정명 입력'
                }
            );

        const dateInput =
            createElement(
                'input',
                'input',
                {
                    type: 'date',
                    value: getTodayString()
                }
            );

        const typeSelect =
            createElement(
                'select',
                'select'
            );

        const types = [
            '휴가 출발',
            '휴가 복귀',
            '당직',
            '외박',
            '외출',
            '외진',
            '훈련',
            '기타'
        ];

        types.forEach((type) => {
            typeSelect.appendChild(
                createElement(
                    'option',
                    '',
                    {
                        value: type,
                        textContent: type
                    }
                )
            );
        });

        const form = createElement(
            'div',
            'form-container'
        );

        form.appendChild(
            createFormGroup(
                '일정명',
                titleInput
            )
        );

        form.appendChild(
            createFormGroup(
                '날짜',
                dateInput
            )
        );

        form.appendChild(
            createFormGroup(
                '유형',
                typeSelect
            )
        );

        Modal.openModal({
            title: '새 일정 추가',
            body: form,
            buttons: [
                {
                    text: '취소',
                    className: 'btn-ghost',
                    onClick: () =>
                        Modal.closeModal()
                },
                {
                    text: '저장',
                    className: 'btn-primary',
                    onClick: () => {
                        if (
                            !titleInput.value.trim()
                        ) {
                            Toast.showToast(
                                '일정명을 입력해주세요.',
                                'error'
                            );

                            return;
                        }

                        ScheduleModule.createSchedule(
                            {
                                title:
                                    titleInput.value.trim(),

                                startDate:
                                    dateInput.value,

                                endDate:
                                    dateInput.value,

                                type:
                                    typeSelect.value
                            }
                        );

                        Toast.showToast(
                            '일정이 저장되었습니다.',
                            'success'
                        );

                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openRewardModal() {
        const typeSelect =
            createElement(
                'select',
                'select'
            );

        [
            '상점',
            '종교',
            '포상휴가',
            '전투휴무',
            '시간외',
            '훈련',
            '기타'
        ].forEach((type) => {
            typeSelect.appendChild(
                createElement(
                    'option',
                    '',
                    {
                        value: type,
                        textContent: type
                    }
                )
            );
        });

        const amountInput =
            createElement(
                'input',
                'input',
                {
                    type: 'number',
                    min: '0',
                    placeholder: '획득량'
                }
            );

        const dateInput =
            createElement(
                'input',
                'input',
                {
                    type: 'date',
                    value: getTodayString()
                }
            );

        const form = createElement(
            'div',
            'form-container'
        );

        form.appendChild(
            createFormGroup(
                '유형',
                typeSelect
            )
        );

        form.appendChild(
            createFormGroup(
                '획득량',
                amountInput
            )
        );

        form.appendChild(
            createFormGroup(
                '날짜',
                dateInput
            )
        );

        Modal.openModal({
            title: '새 보상 추가',
            body: form,
            buttons: [
                {
                    text: '취소',
                    className: 'btn-ghost',
                    onClick: () =>
                        Modal.closeModal()
                },
                {
                    text: '저장',
                    className: 'btn-primary',
                    onClick: () => {
                        const amount =
                            Number(
                                amountInput.value
                            );

                        if (
                            !Number.isFinite(amount) ||
                            amount <= 0
                        ) {
                            Toast.showToast(
                                '획득량을 입력해주세요.',
                                'error'
                            );

                            return;
                        }

                        Rewards.createReward({
                            type:
                                typeSelect.value,

                            amount,

                            date:
                                dateInput.value
                        });

                        Toast.showToast(
                            '보상이 저장되었습니다.',
                            'success'
                        );

                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openTransactionModal() {
        const titleInput =
            createElement(
                'input',
                'input',
                {
                    type: 'text',
                    placeholder: '거래 내역'
                }
            );

        const amountInput =
            createElement(
                'input',
                'input',
                {
                    type: 'number',
                    min: '0',
                    placeholder: '금액'
                }
            );

        const typeSelect =
            createElement(
                'select',
                'select'
            );

        [
            '지출',
            '수입',
            '저축',
            '투자',
            '이체'
        ].forEach((type) => {
            typeSelect.appendChild(
                createElement(
                    'option',
                    '',
                    {
                        value: type,
                        textContent: type
                    }
                )
            );
        });

        const form =
            createElement(
                'div',
                'form-container'
            );

        form.appendChild(
            createFormGroup(
                '거래명',
                titleInput
            )
        );

        form.appendChild(
            createFormGroup(
                '금액',
                amountInput
            )
        );

        form.appendChild(
            createFormGroup(
                '유형',
                typeSelect
            )
        );

        Modal.openModal({
            title: '새 거래 추가',
            body: form,
            buttons: [
                {
                    text: '취소',
                    className: 'btn-ghost',
                    onClick: () =>
                        Modal.closeModal()
                },
                {
                    text: '저장',
                    className: 'btn-primary',
                    onClick: () => {
                        const amount =
                            Number(
                                amountInput.value
                            );

                        if (
                            !titleInput.value.trim() ||
                            !Number.isFinite(amount) ||
                            amount <= 0
                        ) {
                            Toast.showToast(
                                '거래명과 금액을 입력해주세요.',
                                'error'
                            );

                            return;
                        }

                        Finance.createTransaction(
                            {
                                title:
                                    titleInput.value.trim(),

                                amount,

                                type:
                                    typeSelect.value,

                                date:
                                    getTodayString()
                            }
                        );

                        Toast.showToast(
                            '거래가 저장되었습니다.',
                            'success'
                        );

                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openStudyModal() {
        const titleInput =
            createElement(
                'input',
                'input',
                {
                    type: 'text',
                    placeholder: '학습 제목'
                }
            );

        const durationInput =
            createElement(
                'input',
                'input',
                {
                    type: 'number',
                    min: '0',
                    placeholder:
                        '공부시간 (분)'
                }
            );

        const form =
            createElement(
                'div',
                'form-container'
            );

        form.appendChild(
            createFormGroup(
                '제목',
                titleInput
            )
        );

        form.appendChild(
            createFormGroup(
                '공부시간',
                durationInput
            )
        );

        Modal.openModal({
            title: '학습 기록 추가',
            body: form,
            buttons: [
                {
                    text: '취소',
                    className: 'btn-ghost',
                    onClick: () =>
                        Modal.closeModal()
                },
                {
                    text: '저장',
                    className: 'btn-primary',
                    onClick: () => {
                        const minutes =
                            Number(
                                durationInput.value
                            );

                        if (
                            !titleInput.value.trim() ||
                            !Number.isFinite(minutes) ||
                            minutes <= 0
                        ) {
                            Toast.showToast(
                                '제목과 공부시간을 입력해주세요.',
                                'error'
                            );

                            return;
                        }

                        Study.createStudy({
                            title:
                                titleInput.value.trim(),

                            studyMinutes:
                                minutes,

                            date:
                                getTodayString()
                        });

                        Toast.showToast(
                            '학습 기록이 저장되었습니다.',
                            'success'
                        );

                        Modal.closeModal();
                    }
                }
            ]
        });
    },

    openTaskModal() {
        const titleInput =
            createElement(
                'input',
                'input',
                {
                    type: 'text',
                    placeholder: '작업명 입력'
                }
            );

        const prioritySelect =
            createElement(
                'select',
                'select'
            );

        [
            '높음',
            '보통',
            '낮음'
        ].forEach((priority) => {
            const option =
                createElement(
                    'option',
                    '',
                    {
                        value: priority,
                        textContent: priority
                    }
                );

            if (priority === '보통') {
                option.selected = true;
            }

            prioritySelect.appendChild(
                option
            );
        });

        const form =
            createElement(
                'div',
                'form-container'
            );

        form.appendChild(
            createFormGroup(
                '작업명',
                titleInput
            )
        );

        form.appendChild(
            createFormGroup(
                '우선순위',
                prioritySelect
            )
        );

        Modal.openModal({
            title: '새 작업 추가',
            body: form,
            buttons: [
                {
                    text: '취소',
                    className: 'btn-ghost',
                    onClick: () =>
                        Modal.closeModal()
                },
                {
                    text: '저장',
                    className: 'btn-primary',
                    onClick: () => {
                        if (
                            !titleInput.value.trim()
                        ) {
                            Toast.showToast(
                                '작업명을 입력해주세요.',
                                'error'
                            );

                            return;
                        }

                        Tasks.createTask({
                            title:
                                titleInput.value.trim(),

                            priority:
                                prioritySelect.value,

                            status:
                                'Inbox',

                            dueDate:
                                getTodayString()
                        });

                        Toast.showToast(
                            '작업이 저장되었습니다.',
                            'success'
                        );

                        Modal.closeModal();
                    }
                }
            ]
        });
    }
};