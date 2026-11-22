document.documentElement.classList.add("js-enabled");

document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /* ==============================
       헤더 연기 자연스러운 움직임
    ============================== */

    const hero = document.querySelector(".hero");
    const heroSmoke = document.querySelector(".hero-smoke");

    if (hero && heroSmoke && !reduceMotion) {
        let pointerX = 0;
        let pointerY = 0;
        let currentPointerX = 0;
        let currentPointerY = 0;
        let smokeIsVisible = true;
        const animationStart = performance.now();

        hero.addEventListener("pointermove", (event) => {
            const bounds = hero.getBoundingClientRect();

            pointerX =
                ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
            pointerY =
                ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
        });

        hero.addEventListener("pointerleave", () => {
            pointerX = 0;
            pointerY = 0;
        });

        const smokeObserver = new IntersectionObserver((entries) => {
            smokeIsVisible = entries[0].isIntersecting;
        });

        smokeObserver.observe(hero);

        function moveSmoke(currentTime) {
            if (smokeIsVisible) {
                const elapsed = (currentTime - animationStart) / 1000;

                currentPointerX += (pointerX - currentPointerX) * 0.025;
                currentPointerY += (pointerY - currentPointerY) * 0.025;

                const driftX =
                    Math.sin(elapsed * 0.18) * 11 +
                    Math.sin(elapsed * 0.07) * 5;
                const driftY = Math.cos(elapsed * 0.14) * 7;
                const scale =
                    1.045 + Math.sin(elapsed * 0.11) * 0.008;
                const opacity =
                    0.94 + Math.sin(elapsed * 0.16) * 0.035;

                heroSmoke.style.setProperty(
                    "--smoke-x",
                    `${driftX + currentPointerX}px`
                );
                heroSmoke.style.setProperty(
                    "--smoke-y",
                    `${driftY + currentPointerY}px`
                );
                heroSmoke.style.setProperty("--smoke-scale", scale);
                heroSmoke.style.opacity = opacity;
            }

            requestAnimationFrame(moveSmoke);
        }

        requestAnimationFrame(moveSmoke);
    }

    /* ==============================
       메인 제목 타이핑 효과
    ============================== */

    const typingTitle = document.querySelector(".typing-title");

    if (typingTitle && !reduceMotion) {
        const titleLines = [
            (typingTitle.dataset.lineOne || "").normalize("NFC"),
            (typingTitle.dataset.lineTwo || "").normalize("NFC")
        ];
        const caret = document.createElement("span");
        let lineIndex = 0;
        let characterIndex = 0;
        let currentTextNode = document.createTextNode("");

        caret.className = "typing-caret";
        caret.setAttribute("aria-hidden", "true");

        typingTitle.textContent = "";
        typingTitle.appendChild(currentTextNode);
        typingTitle.appendChild(caret);

        function typeTitle() {
            const currentLine = titleLines[lineIndex];

            if (characterIndex < currentLine.length) {
                characterIndex += 1;
                currentTextNode.textContent = currentLine.slice(
                    0,
                    characterIndex
                );
                window.setTimeout(typeTitle, 72);
                return;
            }

            if (lineIndex < titleLines.length - 1) {
                typingTitle.insertBefore(
                    document.createElement("br"),
                    caret
                );
                currentTextNode = document.createTextNode("");
                typingTitle.insertBefore(currentTextNode, caret);
                lineIndex += 1;
                characterIndex = 0;
                window.setTimeout(typeTitle, 260);
                return;
            }

            typingTitle.classList.add("typing-complete");
        }

        window.setTimeout(typeTitle, 450);
    }

    /* ==============================
       스크롤 섹션 등장 효과
    ============================== */

    const animatedSections = document.querySelectorAll(".scrAni");

    if (reduceMotion) {
        animatedSections.forEach((section) => {
            section.classList.add("active");
        });
    } else {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    entry.target.classList.toggle(
                        "active",
                        entry.isIntersecting
                    );
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -80px 0px"
            }
        );

        animatedSections.forEach((section) => {
            sectionObserver.observe(section);
        });
    }


    /* ==============================
       01 원형 그래프 애니메이션 & 인터랙션
    ============================== */

    const originSection = document.querySelector(".section-origin");
    const responseChart = document.querySelector(".response-chart");
    const ringArcs = document.querySelectorAll(".ring-arc");
    const governmentItems = document.querySelectorAll(
        ".government-item[data-target]"
    );
    const centerTag = document.querySelector(".chart-center-tag");
    const centerValue = document.querySelector(".chart-center-value");
    const centerDesc = document.querySelector(".chart-center-desc");

    const originDetailMap = {
        default: {
            tag: "시·도 소방예산 합계",
            value: "8조 5,967억 원"
        },
        local: {
            tag: "지방정부 부담분 (89.3%)",
            value: "7조 6,728억 원"
        },
        central: {
            tag: "국비 지원 (10.7%)",
            value: "9,239억 원"
        }
    };

    let pinnedOriginTarget = "";

    function applyOriginHighlight(targetKey) {
        if (!responseChart) {
            return;
        }

        responseChart.dataset.activeTarget = targetKey || "";

        const info =
            targetKey && originDetailMap[targetKey]
                ? originDetailMap[targetKey]
                : originDetailMap.default;

        if (centerTag) {
            centerTag.textContent = info.tag;
        }
        if (centerValue) {
            centerValue.textContent = info.value;
        }

        governmentItems.forEach((item) => {
            const itemTarget = item.dataset.target;

            item.classList.toggle(
                "is-highlighted",
                Boolean(targetKey) && itemTarget === targetKey
            );
            item.classList.toggle(
                "is-dimmed",
                Boolean(targetKey) && itemTarget !== targetKey
            );
        });
    }

    function prepareRingArcs() {
        ringArcs.forEach((arc) => {
            const radius = Number(arc.getAttribute("r"));
            const percent = Number(arc.dataset.percent);
            const circumference = 2 * Math.PI * radius;
            const arcLength = circumference * (percent / 100) + 0.5;

            arc.style.transition = "none";
            arc.style.strokeDasharray = `${arcLength} ${circumference}`;
            arc.style.strokeDashoffset = arcLength;
        });
    }

    function playRingArcs() {
        ringArcs.forEach((arc) => {
            const radius = Number(arc.getAttribute("r"));
            const percent = Number(arc.dataset.percent);
            const circumference = 2 * Math.PI * radius;
            const arcLength = circumference * (percent / 100) + 0.5;

            arc.style.transition = "";
            arc.style.strokeDasharray = `${arcLength} ${circumference}`;
            arc.style.strokeDashoffset = "0";
        });
    }

    if (originSection && responseChart && ringArcs.length > 0) {
        if (reduceMotion) {
            responseChart.classList.add("chart-active");
            playRingArcs();
        } else {
            prepareRingArcs();

            const originObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            responseChart.classList.add("chart-active");
                            playRingArcs();
                        } else {
                            responseChart.classList.remove("chart-active");
                            prepareRingArcs();
                        }
                    });
                },
                {
                    threshold: 0.28
                }
            );

            originObserver.observe(originSection);
        }

        const interactiveTargets = [
            ...ringArcs,
            ...governmentItems
        ];

        interactiveTargets.forEach((element) => {
            const targetKey = element.dataset.target;

            element.addEventListener("pointerenter", () => {
                if (!pinnedOriginTarget) {
                    applyOriginHighlight(targetKey);
                }
            });

            element.addEventListener("pointerleave", () => {
                if (!pinnedOriginTarget) {
                    applyOriginHighlight("");
                }
            });

            element.addEventListener("focus", () => {
                if (!pinnedOriginTarget) {
                    applyOriginHighlight(targetKey);
                }
            });

            element.addEventListener("blur", () => {
                if (!pinnedOriginTarget) {
                    applyOriginHighlight("");
                }
            });

            element.addEventListener("click", (event) => {
                event.stopPropagation();
                pinnedOriginTarget =
                    pinnedOriginTarget === targetKey ? "" : targetKey;
                applyOriginHighlight(pinnedOriginTarget);
            });

            element.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pinnedOriginTarget =
                        pinnedOriginTarget === targetKey ? "" : targetKey;
                    applyOriginHighlight(pinnedOriginTarget);
                }
            });
        });

        document.addEventListener("click", () => {
            if (pinnedOriginTarget) {
                pinnedOriginTarget = "";
                applyOriginHighlight("");
            }
        });
    }


    /* ==============================
       02 선 그래프 애니메이션
    ============================== */

    const financeSection = document.querySelector(".section-finance");
    const budgetLine = document.querySelector(".budget-line");
    const budgetArea = document.querySelector(".budget-area");
    const budgetPoints = document.querySelectorAll(
        ".budget-point"
    );
    const budgetValues = document.querySelectorAll(
        ".budget-value"
    );

    function prepareFinanceChart() {
        if (!budgetLine) {
            return;
        }

        const lineLength = budgetLine.getTotalLength();

        budgetLine.style.transition = "none";
        budgetLine.style.strokeDasharray = lineLength;
        budgetLine.style.strokeDashoffset = lineLength;

        if (budgetArea) {
            budgetArea.style.transition = "none";
            budgetArea.style.opacity = "0";
        }

        budgetPoints.forEach((point) => {
            point.style.transition = "none";
            point.style.opacity = "0";
            point.style.transform = "scale(0)";
        });

        budgetValues.forEach((value) => {
            value.style.transition = "none";
            value.style.opacity = "0";
            value.style.transform = "translateY(10px)";
        });
    }

    function playFinanceChart() {
        if (!budgetLine) {
            return;
        }

        budgetLine.style.transition =
            "stroke-dashoffset 1.8s ease";
        budgetLine.style.strokeDashoffset = "0";

        if (budgetArea) {
            budgetArea.style.transition =
                "opacity 1.2s ease 0.35s";
            budgetArea.style.opacity = "1";
        }

        budgetPoints.forEach((point, index) => {
            point.style.transition =
                `opacity 0.35s ease ${index * 0.25}s, ` +
                `transform 0.35s ease ${index * 0.25}s`;

            point.style.opacity = "1";
            point.style.transform = "scale(1)";
        });

        budgetValues.forEach((value, index) => {
            const delay = 0.2 + index * 0.25;

            value.style.transition =
                `opacity 0.4s ease ${delay}s, ` +
                `transform 0.4s ease ${delay}s`;

            value.style.opacity = "1";
            value.style.transform = "translateY(0)";
        });
    }

    if (financeSection && budgetLine) {
        if (reduceMotion) {
            playFinanceChart();
        } else {
            prepareFinanceChart();

            const financeObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            playFinanceChart();
                        } else {
                            prepareFinanceChart();
                        }
                    });
                },
                {
                    threshold: 0.35
                }
            );

            financeObserver.observe(financeSection);
        }
    }


    /* ==============================
       03 지역별 지도 비교 인터랙션
    ============================== */

    const regionSection = document.querySelector(".section-region");
    const regionStage = document.querySelector(".region-stage");
    const regionTabs = document.querySelectorAll(".region-tab");
    const regionHotspots = document.querySelectorAll(".map-hotspot");
    const regionResetBtn = document.querySelector(".region-reset-btn");
    const leftCard = document.querySelector(".region-compare-card.is-left");
    const rightCard = document.querySelector(".region-compare-card.is-right");
    const leftPin = document.querySelector(".region-pin.pin-left");
    const rightPin = document.querySelector(".region-pin.pin-right");
    const regionMapWrap = document.querySelector(".region-map-wrap");
    const leftConnector = document.querySelector(".connector-left");
    const rightConnector = document.querySelector(".connector-right");

    const leftNameEl = document.querySelector('[data-slot-name="left"]');
    const rightNameEl = document.querySelector('[data-slot-name="right"]');
    const leftEquipEl = document.querySelector('[data-slot-equipment="left"]');
    const leftTreatEl = document.querySelector('[data-slot-treatment="left"]');
    const rightEquipEl = document.querySelector('[data-slot-equipment="right"]');
    const rightTreatEl = document.querySelector('[data-slot-treatment="right"]');

    const regionData = {
        seoul: {
            name: "서울",
            equipment: 70,
            treatment: 84,
            x: 22.0,
            y: 22.1
        },
        gyeonggi: {
            name: "경기",
            equipment: 65,
            treatment: 78,
            x: 34.0,
            y: 27.5
        },
        incheon: {
            name: "인천",
            equipment: 47,
            treatment: 57,
            x: 15.6,
            y: 22.1
        },
        gyeongnam: {
            name: "경남",
            equipment: 43,
            treatment: 29,
            x: 68.0,
            y: 67.2
        },
        gyeongbuk: {
            name: "경북",
            equipment: 32,
            treatment: 21,
            x: 75.0,
            y: 47.5
        },
        jeonnam: {
            name: "전남",
            equipment: 21,
            treatment: 14,
            x: 25.0,
            y: 75.4
        }
    };

    let leftRegionKey = null;
    let rightRegionKey = null;
    const metricAnimFrames = new WeakMap();

    function animateMetricValue(el, targetValue) {
        if (!el) {
            return;
        }

        const prevFrame = metricAnimFrames.get(el);
        if (prevFrame) {
            cancelAnimationFrame(prevFrame);
        }

        if (reduceMotion) {
            el.textContent = `${targetValue}%`;
            return;
        }

        const startTime = performance.now();
        const duration = 520;

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${Math.round(targetValue * eased)}%`;

            if (progress < 1) {
                metricAnimFrames.set(el, requestAnimationFrame(step));
            }
        }

        metricAnimFrames.set(el, requestAnimationFrame(step));
    }

    function drawConnector(pathEl, d, animate) {
        if (!pathEl) {
            return;
        }

        pathEl.setAttribute("d", d);

        if (!d) {
            return;
        }

        const length = pathEl.getTotalLength();

        if (!animate || reduceMotion) {
            pathEl.style.transition = "none";
            pathEl.style.strokeDasharray = length;
            pathEl.style.strokeDashoffset = "0";
            return;
        }

        pathEl.style.transition = "none";
        pathEl.style.strokeDasharray = length;
        pathEl.style.strokeDashoffset = length;
        pathEl.getBoundingClientRect();
        pathEl.style.transition = "";
        pathEl.style.strokeDashoffset = "0";
    }

    function getPinHeadCoords(stageRect, mapRect, info) {
        const pinX =
            mapRect.left - stageRect.left + mapRect.width * (info.x / 100);
        const pinY =
            mapRect.top - stageRect.top + mapRect.height * (info.y / 100) - 24;
        return { x: pinX, y: pinY };
    }

    function updateConnectorLines(animateLeft = false, animateRight = false) {
        if (!regionStage || !leftRegionKey || window.innerWidth <= 700) {
            if (leftConnector) leftConnector.setAttribute("d", "");
            if (rightConnector) rightConnector.setAttribute("d", "");
            return;
        }

        const stageRect = regionStage.getBoundingClientRect();
        const mapRect = regionMapWrap.getBoundingClientRect();
        const leftInfo = regionData[leftRegionKey];
        const leftTitleRect = leftNameEl.getBoundingClientRect();
        const lPin = getPinHeadCoords(stageRect, mapRect, leftInfo);

        const lStartX = leftTitleRect.right - stageRect.left + 18;
        const lStartY =
            leftTitleRect.top + leftTitleRect.height / 2 - stageRect.top;

        let leftPath = "";
        if (Math.abs(lStartY - lPin.y) <= 18) {
            leftPath = `M ${lStartX} ${lPin.y} L ${lPin.x} ${lPin.y}`;
        } else {
            const lElbowX = mapRect.left - stageRect.left - 24;
            leftPath =
                `M ${lStartX} ${lStartY} ` +
                `L ${lElbowX} ${lStartY} ` +
                `L ${lElbowX} ${lPin.y} ` +
                `L ${lPin.x} ${lPin.y}`;
        }

        drawConnector(leftConnector, leftPath, animateLeft);

        if (!rightRegionKey) {
            if (rightConnector) rightConnector.setAttribute("d", "");
            return;
        }

        const rightInfo = regionData[rightRegionKey];
        const rightTitleRect = rightNameEl.getBoundingClientRect();
        const rPin = getPinHeadCoords(stageRect, mapRect, rightInfo);

        const rEndX = rightTitleRect.left - stageRect.left - 18;
        const rEndY =
            rightTitleRect.top + rightTitleRect.height / 2 - stageRect.top;
        const rElbowX = Math.min(
            rEndX - 18,
            mapRect.right - stageRect.left + 26
        );

        let rightPath = "";
        if (Math.abs(rEndY - rPin.y) <= 18) {
            rightPath = `M ${rPin.x} ${rPin.y} L ${rEndX} ${rPin.y}`;
        } else {
            rightPath =
                `M ${rPin.x} ${rPin.y} ` +
                `L ${rElbowX} ${rPin.y} ` +
                `L ${rElbowX} ${rEndY} ` +
                `L ${rEndX} ${rEndY}`;
        }

        drawConnector(rightConnector, rightPath, animateRight);
    }

    function renderRegionComparison(animateLeft = true, animateRight = true) {
        if (!regionStage) {
            return;
        }

        const hasLeft = Boolean(leftRegionKey);
        const hasRight = Boolean(rightRegionKey);

        regionStage.classList.toggle("is-comparing", hasLeft);
        regionStage.classList.toggle("is-two-comparing", hasLeft && hasRight);
        regionStage.dataset.state = hasLeft ? "comparing" : "idle";

        if (leftCard) {
            leftCard.hidden = !hasLeft;
        }
        if (rightCard) {
            rightCard.hidden = !hasRight;
        }
        if (leftPin) {
            leftPin.hidden = !hasLeft;
        }
        if (rightPin) {
            rightPin.hidden = !hasRight;
        }
        if (regionResetBtn) {
            regionResetBtn.hidden = !hasLeft;
        }

        regionTabs.forEach((tab) => {
            const key = tab.dataset.region;
            tab.classList.toggle("is-left", key === leftRegionKey);
            tab.classList.toggle("is-right", key === rightRegionKey);
            tab.setAttribute(
                "aria-pressed",
                key === leftRegionKey || key === rightRegionKey ? "true" : "false"
            );
        });

        if (!hasLeft) {
            updateConnectorLines(false, false);
            return;
        }

        const leftInfo = regionData[leftRegionKey];
        if (leftNameEl) leftNameEl.textContent = leftInfo.name;
        if (animateLeft) {
            animateMetricValue(leftEquipEl, leftInfo.equipment);
            animateMetricValue(leftTreatEl, leftInfo.treatment);
        }
        if (leftPin) {
            leftPin.style.left = `${leftInfo.x}%`;
            leftPin.style.top = `${leftInfo.y}%`;
        }

        if (hasRight) {
            const rightInfo = regionData[rightRegionKey];
            if (rightNameEl) rightNameEl.textContent = rightInfo.name;
            if (animateRight) {
                animateMetricValue(rightEquipEl, rightInfo.equipment);
                animateMetricValue(rightTreatEl, rightInfo.treatment);
            }
            if (rightPin) {
                rightPin.style.left = `${rightInfo.x}%`;
                rightPin.style.top = `${rightInfo.y}%`;
            }
        }

        requestAnimationFrame(() => {
            updateConnectorLines(animateLeft, animateRight);
        });
    }

    function selectRegion(regionKey) {
        if (!regionData[regionKey]) {
            return;
        }

        let animateLeft = false;
        let animateRight = false;

        if (!leftRegionKey) {
            leftRegionKey = regionKey;
            rightRegionKey = null;
            animateLeft = true;
        } else if (regionKey === leftRegionKey) {
            if (rightRegionKey) {
                leftRegionKey = rightRegionKey;
                rightRegionKey = null;
                animateLeft = true;
            } else {
                leftRegionKey = null;
            }
        } else if (regionKey === rightRegionKey) {
            rightRegionKey = null;
        } else {
            rightRegionKey = regionKey;
            animateRight = true;
        }

        renderRegionComparison(animateLeft, animateRight);
    }

    if (regionSection && regionStage) {
        regionTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                selectRegion(tab.dataset.region);
            });
        });

        regionHotspots.forEach((spot) => {
            spot.addEventListener("click", () => {
                selectRegion(spot.dataset.region);
            });
        });

        if (regionResetBtn) {
            regionResetBtn.addEventListener("click", () => {
                leftRegionKey = null;
                rightRegionKey = null;
                renderRegionComparison(false);
            });
        }

        window.addEventListener("resize", () => {
            updateConnectorLines(false);
        });
    }


    /* ==============================
       04 숫자 카운트 & 위험 지표 인터랙션
    ============================== */

    const dangerSection = document.querySelector(".section-danger");
    const countNumbers = document.querySelectorAll(".count-number");
    const dangerTopicButtons = document.querySelectorAll(".danger-topic-btn");
    const dangerDetailBox = document.querySelector(".danger-detail-box");
    const dangerDetailTitle = document.querySelector(".danger-detail-title");
    const dangerDetailValue = document.querySelector(".danger-detail-value");
    const dangerDetailLabel = document.querySelector(".danger-detail-label");
    const dangerDetailText = document.querySelector(".danger-detail-text");
    let countRunId = 0;

    const dangerDetailMap = {
        death: {
            title: "공무상 사망",
            value: "35명",
            label: "전국 위험직무 순직",
            text: "위험직무 순직으로 집계된 인원이며 연평균 3.5명입니다."
        },
        "duty-death": {
            title: "순직 인정",
            value: "121명",
            label: "전국 순직 집계",
            text: "위험직무 순직 35명과 일반 순직 86명을 합산했습니다. 공무상 사망 항목의 35명은 이 합계에 포함됩니다."
        },
        injury: {
            title: "공무상 부상",
            value: "1,445명",
            label: "전국 공상 승인 인원",
            text: "공상 승인 집계로, 부상 외 공무상 질병 등이 포함될 수 있습니다. 2023년에는 1,334명이었습니다."
        },
        disease: {
            title: "직업성 질환",
            value: "28명",
            label: "전국 일반 순직 중 암 사례",
            text: "암으로 일반 순직한 인원을 보여줍니다. 공무상 질병 전체 승인 건수는 별도 지표입니다."
        },
        ptsd: {
            title: "PTSD·심리 지원",
            value: "7.2%",
            label: "전국 마음건강 설문 PTSD 위험군",
            text: "심리 지원 이용 실적은 강원 지역 사례로, 2025년 상반기 찾아가는 상담실 이용자는 2,725명입니다."
        }
    };

    function formatCount(value) {
        return Number(value).toLocaleString("en-US");
    }

    function animateNumber(element, runId) {
        const target = Number(element.dataset.count);
        const duration = 1400;
        const startTime = performance.now();

        element.textContent = "0";

        function updateNumber(currentTime) {
            if (runId !== countRunId) {
                return;
            }

            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            /*
             * 처음에는 빠르게 증가하고
             * 마지막에 천천히 멈추는 효과입니다.
             */
            const easedProgress =
                1 - Math.pow(1 - progress, 3);

            const currentNumber = Math.floor(
                target * easedProgress
            );

            element.textContent = formatCount(currentNumber);

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = formatCount(target);
            }
        }

        requestAnimationFrame(updateNumber);
    }

    function playCountAnimation() {
        countRunId += 1;
        const currentRunId = countRunId;

        countNumbers.forEach((number, index) => {
            window.setTimeout(() => {
                if (currentRunId === countRunId) {
                    animateNumber(number, currentRunId);
                }
            }, index * 250);
        });
    }

    function prepareCountAnimation() {
        countRunId += 1;

        countNumbers.forEach((number) => {
            number.textContent = "0";
        });
    }

    if (dangerSection && countNumbers.length > 0) {
        if (reduceMotion) {
            countNumbers.forEach((number) => {
                number.textContent = formatCount(number.dataset.count);
            });
        } else {
            prepareCountAnimation();

            const dangerObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            playCountAnimation();
                        } else {
                            prepareCountAnimation();
                        }
                    });
                },
                {
                    threshold: 0.35
                }
            );

            dangerObserver.observe(dangerSection);
        }
    }

    if (dangerTopicButtons.length > 0 && dangerDetailBox) {
        dangerTopicButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const key = btn.dataset.dangerKey;
                const detail = dangerDetailMap[key];

                if (!detail) {
                    return;
                }

                dangerTopicButtons.forEach((item) => {
                    const isActive = item === btn;
                    item.classList.toggle("is-active", isActive);
                    item.setAttribute(
                        "aria-pressed",
                        isActive ? "true" : "false"
                    );
                });

                if (dangerDetailTitle) {
                    dangerDetailTitle.textContent = detail.title;
                }
                if (dangerDetailValue) {
                    dangerDetailValue.textContent = detail.value;
                }
                if (dangerDetailLabel) {
                    dangerDetailLabel.textContent = detail.label;
                }
                if (dangerDetailText) {
                    dangerDetailText.textContent = detail.text;
                }

                dangerDetailBox.classList.remove("is-updating");
                dangerDetailBox.offsetWidth;
                dangerDetailBox.classList.add("is-updating");
            });
        });
    }


    /* ==============================
       06 예산 카드 클릭 & 등장 인터랙션
    ============================== */

    const impactSection = document.querySelector(".section-impact");
    const impactCards = document.querySelectorAll(".impact-card");
    const finalMessage = document.querySelector(".final-message");

    function prepareImpactItems() {
        impactCards.forEach((card) => {
            card.style.transition = "none";
            card.style.opacity = "0";
            card.style.transform = "translateY(28px)";
        });

        if (finalMessage) {
            finalMessage.style.transition = "none";
            finalMessage.style.opacity = "0";
            finalMessage.style.transform = "translateY(25px)";
        }
    }

    function playImpactItems() {
        impactCards.forEach((card, index) => {
            const delay = index * 0.12;

            card.style.transition =
                `opacity 0.6s ease ${delay}s, ` +
                `transform 0.6s ease ${delay}s, ` +
                `background-color 0.28s ease, ` +
                `box-shadow 0.28s ease`;

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        });

        if (finalMessage) {
            const messageDelay =
                impactCards.length * 0.12 + 0.2;

            finalMessage.style.transition =
                `opacity 0.7s ease ${messageDelay}s, ` +
                `transform 0.7s ease ${messageDelay}s`;

            finalMessage.style.opacity = "1";
            finalMessage.style.transform = "translateY(0)";
        }
    }

    if (impactCards.length > 0) {
        impactCards.forEach((card) => {
            card.addEventListener("click", () => {
                const isOpen = card.classList.toggle("is-open");
                card.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        });
    }

    if (impactSection && impactCards.length > 0) {
        if (reduceMotion) {
            playImpactItems();
        } else {
            prepareImpactItems();

            const impactObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            playImpactItems();
                        } else {
                            prepareImpactItems();
                        }
                    });
                },
                {
                    threshold: 0.2
                }
            );

            impactObserver.observe(impactSection);
        }
    }
});
