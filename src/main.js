import plugin from "../plugin.json";

class WebPreview {
    baseUrl = "";
    page = null;

    commands = null;
    actionStack = null;

    floatingButton = null;
    floatingButtonStyle = null;

    iframe = null;
    urlInput = null;

    backButton = null;
    forwardButton = null;
    refreshButton = null;
    menuButton = null;
    closeButton = null;

    menu = null;

    isDragging = false;
    hasMoved = false;

    dragOffsetX = 0;
    dragOffsetY = 0;

    buttonX = null;
    buttonY = null;

    previewOpen = false;

    actionId = "web-preview.close";

    storageKey =
        "web-preview.last-url";

    localPorts = [
        5173,
        5174,
        3000,
        3001,
        8080,
        4321,
        5000
    ];

    defaultUrl =
        "http://localhost:5173";

    currentMode = "responsive";

    modes = {
        responsive: {
            name: "Responsive",
            width: "100%",
            height: "100%"
        },

        mobile: {
            name: "Mobile",
            width: 390,
            height: 844
        },

        tablet: {
            name: "Tablet",
            width: 768,
            height: 1024
        },

        desktop: {
            name: "Desktop",
            width: 1440,
            height: 900
        }
    };

    async init($page) {
        this.page = $page;

        /*
         * Remove Acode's default page header.
         */
        if (this.page.header) {
            this.page.header.style.display =
                "none";
        }

        this.commands =
            acode.require("commands");

        this.actionStack =
            acode.require("actionStack");

        this.createPage();
        this.setupPageNavigation();
        this.registerCommands();
        this.createFloatingButton();
    }

    createPage() {
        const style =
            document.createElement("style");

        style.textContent = `
            .web-preview {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                background: #1f1f1f;
                color: #ffffff;
            }

            .web-preview-toolbar {
                position: relative;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px;
                flex-shrink: 0;
                box-sizing: border-box;
                background: #1f1f1f;
            }

            .web-preview-nav-button {
                width: 38px;
                height: 38px;
                padding: 0;
                border: none;
                border-radius: 7px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                background: #2d2d2d;
                color: #ffffff;
                font-size: 20px;
                cursor: pointer;
            }

            .web-preview-nav-button:active {
                background: #3a3a3a;
            }

            .web-preview-url-wrapper {
                flex: 1;
                min-width: 0;
                height: 38px;
                display: flex;
                align-items: center;
                border-radius: 8px;
                overflow: hidden;
                background: #2d2d2d;
            }

            .web-preview-url-icon {
                width: 32px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                opacity: 0.75;
            }

            .web-preview-url {
                width: 100%;
                min-width: 0;
                height: 100%;
                padding: 0 8px 0 0;
                border: none;
                outline: none;
                background: transparent;
                color: #ffffff;
                font-size: 14px;
                box-sizing: border-box;
            }

            .web-preview-url::placeholder {
                color: #aaaaaa;
            }

            .web-preview-menu-button {
                width: 38px;
                height: 38px;
                padding: 0;
                border: none;
                border-radius: 7px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                background: #2d2d2d;
                color: #ffffff;
                font-size: 22px;
                cursor: pointer;
            }

            .web-preview-menu-button:active {
                background: #3a3a3a;
            }

            .web-preview-close {
                font-size: 22px;
            }

            .web-preview-content {
                flex: 1;
                min-height: 0;
                width: 100%;
                overflow: auto;
                position: relative;
                background: #eeeeee;
                box-sizing: border-box;
            }

            .web-preview-viewport {
                width: 100%;
                min-height: 100%;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 0;
                box-sizing: border-box;
            }

            .web-preview-frame {
                display: block;
                flex-shrink: 0;
                width: 100%;
                height: 100%;
                border: 0;
                background: #ffffff;
                transition:
                    width 0.2s ease,
                    height 0.2s ease;
            }

            .web-preview-menu {
                position: absolute;
                top: 52px;
                right: 8px;
                width: 220px;
                padding: 6px;
                border-radius: 10px;
                background: #292929;
                box-shadow:
                    0 8px 28px
                    rgba(0, 0, 0, 0.45);
                z-index: 100000;
                display: none;
                box-sizing: border-box;
            }

            .web-preview-menu.open {
                display: block;
            }

            .web-preview-menu-title {
                padding: 8px 10px 6px;
                font-size: 12px;
                color: #aaaaaa;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .web-preview-menu-item {
                width: 100%;
                min-height: 42px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 8px 10px;
                border: none;
                border-radius: 7px;
                background: transparent;
                color: #ffffff;
                text-align: left;
                font-size: 14px;
                cursor: pointer;
                box-sizing: border-box;
            }

            .web-preview-menu-item:active {
                background: #3a3a3a;
            }

            .web-preview-menu-item-left {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
            }

            .web-preview-menu-icon {
                width: 24px;
                text-align: center;
                flex-shrink: 0;
            }

            .web-preview-menu-check {
                width: 20px;
                text-align: center;
                color: #ffffff;
                flex-shrink: 0;
            }

            .web-preview-menu-divider {
                height: 1px;
                margin: 6px 4px;
                background: #444444;
            }

            @media (max-width: 600px) {
                .web-preview-toolbar {
                    gap: 4px;
                    padding: 6px;
                }

                .web-preview-nav-button {
                    width: 34px;
                    height: 36px;
                }

                .web-preview-menu-button {
                    width: 34px;
                    height: 36px;
                }

                .web-preview-url-wrapper {
                    height: 36px;
                }

                .web-preview-menu {
                    top: 48px;
                    right: 6px;
                }
            }
        `;

        this.page.appendChild(style);

        const savedUrl =
            this.getSavedUrl();

        const initialUrl =
            savedUrl || this.defaultUrl;

        this.page.innerHTML += `
            <div class="web-preview">

                <div class="web-preview-toolbar">

                    <button
                        class="web-preview-nav-button web-preview-back"
                        type="button"
                        title="Go back"
                        aria-label="Go back"
                    >
                        ←
                    </button>

                    <button
                        class="web-preview-nav-button web-preview-forward"
                        type="button"
                        title="Go forward"
                        aria-label="Go forward"
                    >
                        →
                    </button>

                    <button
                        class="web-preview-nav-button web-preview-reload"
                        type="button"
                        title="Reload"
                        aria-label="Reload"
                    >
                        ↻
                    </button>

                    <div
                        class="web-preview-url-wrapper"
                    >

                        <div
                            class="web-preview-url-icon"
                        >
                            🌐
                        </div>

                        <input
                            class="web-preview-url"
                            type="url"
                            placeholder="localhost:5173"
                            value="${initialUrl}"
                        />

                    </div>

                    <button
                        class="web-preview-menu-button"
                        type="button"
                        title="Preview options"
                        aria-label="Preview options"
                    >
                        ⋮
                    </button>

                    <button
                        class="web-preview-nav-button web-preview-close"
                        type="button"
                        title="Close preview"
                        aria-label="Close preview"
                    >
                        ×
                    </button>

                    <div
                        class="web-preview-menu"
                    >

                        <div
                            class="web-preview-menu-title"
                        >
                            Preview Mode
                        </div>

                        <button
                            class="web-preview-menu-item"
                            data-mode="responsive"
                            type="button"
                        >

                            <span
                                class="web-preview-menu-item-left"
                            >
                                <span
                                    class="web-preview-menu-icon"
                                >
                                    ↔
                                </span>

                                <span>
                                    Responsive
                                </span>
                            </span>

                            <span
                                class="web-preview-menu-check"
                            >
                                ✓
                            </span>

                        </button>

                        <button
                            class="web-preview-menu-item"
                            data-mode="mobile"
                            type="button"
                        >

                            <span
                                class="web-preview-menu-item-left"
                            >
                                <span
                                    class="web-preview-menu-icon"
                                >
                                    📱
                                </span>

                                <span>
                                    Mobile
                                </span>
                            </span>

                            <span
                                class="web-preview-menu-check"
                            >
                            </span>

                        </button>

                        <button
                            class="web-preview-menu-item"
                            data-mode="tablet"
                            type="button"
                        >

                            <span
                                class="web-preview-menu-item-left"
                            >
                                <span
                                    class="web-preview-menu-icon"
                                >
                                    ▣
                                </span>

                                <span>
                                    Tablet
                                </span>
                            </span>

                            <span
                                class="web-preview-menu-check"
                            >
                            </span>

                        </button>

                        <button
                            class="web-preview-menu-item"
                            data-mode="desktop"
                            type="button"
                        >

                            <span
                                class="web-preview-menu-item-left"
                            >
                                <span
                                    class="web-preview-menu-icon"
                                >
                                    🖥
                                </span>

                                <span>
                                    Desktop
                                </span>
                            </span>

                            <span
                                class="web-preview-menu-check"
                            >
                            </span>

                        </button>

                        <div
                            class="web-preview-menu-divider"
                        ></div>

                        <button
                            class="web-preview-menu-item web-preview-detect"
                            type="button"
                        >

                            <span
                                class="web-preview-menu-item-left"
                            >
                                <span
                                    class="web-preview-menu-icon"
                                >
                                    🔍
                                </span>

                                <span>
                                    Detect Local Server
                                </span>
                            </span>

                        </button>

                    </div>

                </div>

                <div
                    class="web-preview-content"
                >

                    <div
                        class="web-preview-viewport"
                    >

                        <iframe
                            class="web-preview-frame"
                            title="Web Preview"
                        ></iframe>

                    </div>

                </div>

            </div>
        `;

        this.urlInput =
            this.page.querySelector(
                ".web-preview-url"
            );

        this.iframe =
            this.page.querySelector(
                ".web-preview-frame"
            );

        this.backButton =
            this.page.querySelector(
                ".web-preview-back"
            );

        this.forwardButton =
            this.page.querySelector(
                ".web-preview-forward"
            );

        this.refreshButton =
            this.page.querySelector(
                ".web-preview-reload"
            );

        this.menuButton =
            this.page.querySelector(
                ".web-preview-menu-button"
            );

        this.closeButton =
            this.page.querySelector(
                ".web-preview-close"
            );

        this.menu =
            this.page.querySelector(
                ".web-preview-menu"
            );

        this.backButton.addEventListener(
            "click",
            () => {
                this.goBack();
            }
        );

        this.forwardButton.addEventListener(
            "click",
            () => {
                this.goForward();
            }
        );

        this.refreshButton.addEventListener(
            "click",
            () => {
                this.refresh();
            }
        );

        this.menuButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                this.toggleMenu();
            }
        );

        this.closeButton.addEventListener(
            "click",
            () => {
                this.close();
            }
        );

        this.urlInput.addEventListener(
            "keydown",
            (event) => {
                if (event.key === "Enter") {
                    this.loadUrl();
                }
            }
        );

        const modeButtons =
            this.page.querySelectorAll(
                "[data-mode]"
            );

        modeButtons.forEach(
            (button) => {
                button.addEventListener(
                    "click",
                    () => {
                        const mode =
                            button.dataset.mode;

                        this.setPreviewMode(
                            mode
                        );
                    }
                );
            }
        );

        const detectButton =
            this.page.querySelector(
                ".web-preview-detect"
            );

        detectButton.addEventListener(
            "click",
            () => {
                this.closeMenu();

                this.detectLocalServer();
            }
        );

        document.addEventListener(
            "pointerdown",
            (event) => {
                if (!this.menu) {
                    return;
                }

                if (
                    !this.menu.contains(
                        event.target
                    ) &&
                    event.target !==
                        this.menuButton
                ) {
                    this.closeMenu();
                }
            }
        );

        this.iframe.addEventListener(
            "load",
            () => {
                this.hideEmptyState();
            }
        );

        this.setPreviewMode(
            this.currentMode
        );
    }

    setupPageNavigation() {
        const page = this.page;

        page.show = () => {
            if (this.previewOpen) {
                return;
            }

            this.previewOpen = true;

            this.hideFloatingButton();

            this.actionStack?.remove(
                this.actionId
            );

            this.actionStack?.push({
                id: this.actionId,

                action: () => {
                    this.closeFromBack();
                },
            });

            app.append(page);

            this.detectLocalServer();
        };
    }

    toggleMenu() {
        if (!this.menu) {
            return;
        }

        this.menu.classList.toggle(
            "open"
        );
    }

    closeMenu() {
        if (!this.menu) {
            return;
        }

        this.menu.classList.remove(
            "open"
        );
    }

    setPreviewMode(mode) {
        if (!this.modes[mode]) {
            return;
        }

        this.currentMode =
            mode;

        const viewport =
            this.page.querySelector(
                ".web-preview-viewport"
            );

        if (!viewport || !this.iframe) {
            return;
        }

        const config =
            this.modes[mode];

        if (mode === "responsive") {
            viewport.style.width =
                "100%";

            viewport.style.height =
                "100%";

            viewport.style.minHeight =
                "100%";

            viewport.style.alignItems =
                "flex-start";

            viewport.style.justifyContent =
                "center";

            this.iframe.style.width =
                "100%";

            this.iframe.style.height =
                "100%";

            this.iframe.style.boxShadow =
                "none";
        } else {
            viewport.style.width =
                `${config.width}px`;

            viewport.style.height =
                `${config.height}px`;

            viewport.style.minHeight =
                `${config.height}px`;

            viewport.style.alignItems =
                "flex-start";

            viewport.style.justifyContent =
                "center";

            this.iframe.style.width =
                `${config.width}px`;

            this.iframe.style.height =
                `${config.height}px`;

            this.iframe.style.boxShadow =
                "0 4px 18px rgba(0,0,0,0.25)";
        }

        this.updateModeChecks();

        this.closeMenu();
    }

    updateModeChecks() {
        const buttons =
            this.page.querySelectorAll(
                "[data-mode]"
            );

        buttons.forEach(
            (button) => {
                const check =
                    button.querySelector(
                        ".web-preview-menu-check"
                    );

                if (!check) {
                    return;
                }

                check.textContent =
                    button.dataset.mode ===
                    this.currentMode
                        ? "✓"
                        : "";
            }
        );
    }

    createFloatingButton() {
        const style =
            document.createElement("style");

        style.id =
            "web-preview-floating-button-style";

        style.textContent = `
            .web-preview-floating-button {
                position: fixed;

                right: 20px;
                bottom: 100px;

                width: 60px;
                height: 60px;

                padding: 0;

                border: none;
                border-radius: 50%;

                display: flex;
                align-items: center;
                justify-content: center;

                background: #1f1f1f;

                color: #ffffff;

                box-shadow:
                    0 5px 16px
                    rgba(0, 0, 0, 0.35);

                z-index: 99999;

                cursor: grab;

                touch-action: none;

                user-select: none;
                -webkit-user-select: none;

                transform:
                    translate3d(0, 0, 0)
                    scale(1);

                transition:
                    transform 0.18s
                    cubic-bezier(
                        0.2,
                        0.8,
                        0.2,
                        1
                    ),

                    box-shadow 0.18s ease,

                    opacity 0.15s ease;
            }

            .web-preview-floating-button.dragging {
                cursor: grabbing;

                transform:
                    translate3d(0, 0, 0)
                    scale(1.08);

                box-shadow:
                    0 8px 24px
                    rgba(0, 0, 0, 0.45);
            }

            .web-preview-floating-button svg {
                width: 30px;
                height: 30px;

                pointer-events: none;

                transition:
                    transform 0.18s ease;
            }

            .web-preview-floating-button.dragging svg {
                transform: scale(1.04);
            }
        `;

        document.head.appendChild(style);

        const button =
            document.createElement("button");

        button.className =
            "web-preview-floating-button";

        button.type = "button";

        button.title = "Web Preview";

        button.setAttribute(
            "aria-label",
            "Open Web Preview"
        );

        button.innerHTML = `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >

                <circle
                    cx="12"
                    cy="12"
                    r="9"
                ></circle>

                <line
                    x1="3"
                    y1="12"
                    x2="21"
                    y2="12"
                ></line>

                <path
                    d="
                        M12 3
                        c2.5 2.5
                        3.8 5.5
                        3.8 9
                        s-1.3 6.5
                        -3.8 9
                    "
                ></path>

                <path
                    d="
                        M12 3
                        c-2.5 2.5
                        -3.8 5.5
                        -3.8 9
                        s1.3 6.5
                        3.8 9
                    "
                ></path>

            </svg>
        `;

        this.setupDragging(button);

        document.body.appendChild(button);

        this.floatingButton = button;
        this.floatingButtonStyle = style;
    }

    setupDragging(button) {
        button.addEventListener(
            "pointerdown",
            (event) => {
                this.isDragging = true;
                this.hasMoved = false;

                const rect =
                    button.getBoundingClientRect();

                this.dragOffsetX =
                    event.clientX -
                    rect.left;

                this.dragOffsetY =
                    event.clientY -
                    rect.top;

                button.classList.add(
                    "dragging"
                );

                button.setPointerCapture(
                    event.pointerId
                );
            }
        );

        button.addEventListener(
            "pointermove",
            (event) => {
                if (!this.isDragging) {
                    return;
                }

                if (
                    Math.abs(
                        event.movementX || 0
                    ) > 1 ||
                    Math.abs(
                        event.movementY || 0
                    ) > 1
                ) {
                    this.hasMoved = true;
                }

                const buttonWidth =
                    button.offsetWidth;

                const buttonHeight =
                    button.offsetHeight;

                const margin = 10;

                let x =
                    event.clientX -
                    this.dragOffsetX;

                let y =
                    event.clientY -
                    this.dragOffsetY;

                const maxX =
                    window.innerWidth -
                    buttonWidth -
                    margin;

                const maxY =
                    window.innerHeight -
                    buttonHeight -
                    margin;

                x = Math.max(
                    margin,
                    Math.min(x, maxX)
                );

                y = Math.max(
                    margin,
                    Math.min(y, maxY)
                );

                button.style.left =
                    `${x}px`;

                button.style.top =
                    `${y}px`;

                button.style.right =
                    "auto";

                button.style.bottom =
                    "auto";

                this.buttonX = x;
                this.buttonY = y;
            }
        );

        button.addEventListener(
            "pointerup",
            (event) => {
                if (!this.isDragging) {
                    return;
                }

                this.isDragging = false;

                button.classList.remove(
                    "dragging"
                );

                if (
                    button.hasPointerCapture(
                        event.pointerId
                    )
                ) {
                    button.releasePointerCapture(
                        event.pointerId
                    );
                }
            }
        );

        button.addEventListener(
            "pointercancel",
            () => {
                this.isDragging = false;

                button.classList.remove(
                    "dragging"
                );
            }
        );

        button.addEventListener(
            "click",
            (event) => {
                if (this.hasMoved) {
                    event.preventDefault();
                    event.stopPropagation();

                    this.hasMoved = false;

                    return;
                }

                this.open();
            }
        );
    }

    registerCommands() {
        this.commands.addCommand({
            name: "web-preview.open",

            description:
                "Open Web Preview",

            exec: () => {
                this.open();
            },
        });
    }

    open() {
        if (!this.page) {
            return;
        }

        this.page.show();
    }

    close() {
        if (
            !this.page ||
            !this.previewOpen
        ) {
            return;
        }

        this.actionStack?.remove(
            this.actionId
        );

        this.previewOpen = false;

        this.closeMenu();

        this.page.hide();

        this.showFloatingButton();
    }

    closeFromBack() {
        if (!this.page) {
            return;
        }

        this.previewOpen = false;

        this.closeMenu();

        this.page.hide();

        this.showFloatingButton();
    }

    goBack() {
        if (!this.iframe) {
            return;
        }

        try {
            this.iframe.contentWindow.history.back();
        } catch {
            // Ignore navigation errors.
        }
    }

    goForward() {
        if (!this.iframe) {
            return;
        }

        try {
            this.iframe.contentWindow.history.forward();
        } catch {
            // Ignore navigation errors.
        }
    }

    async detectLocalServer() {
        this.hideEmptyState();

        this.setDetecting(true);

        for (const port of this.localPorts) {
            const url =
                `http://localhost:${port}`;

            const available =
                await this.checkServer(url);

            if (available) {
                this.saveUrl(url);

                this.urlInput.value =
                    url;

                this.iframe.src =
                    url;

                this.setDetecting(false);

                return url;
            }
        }

        this.setDetecting(false);

        this.showEmptyState();

        return null;
    }

    checkServer(url) {
        return new Promise(
            (resolve) => {
                const controller =
                    new AbortController();

                const timeout =
                    setTimeout(
                        () => {
                            controller.abort();

                            resolve(false);
                        },
                        1200
                    );

                fetch(
                    url,
                    {
                        method: "GET",
                        mode: "no-cors",
                        cache: "no-store",
                        signal:
                            controller.signal,
                    }
                )
                    .then(() => {
                        clearTimeout(timeout);

                        resolve(true);
                    })
                    .catch(() => {
                        clearTimeout(timeout);

                        resolve(false);
                    });
            }
        );
    }

    loadUrl() {
        let url =
            this.urlInput.value.trim();

        if (!url) {
            return;
        }

        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {
            url =
                `http://${url}`;
        }

        this.urlInput.value =
            url;

        this.saveUrl(url);

        this.hideEmptyState();

        this.iframe.src =
            url;
    }

    refresh() {
        if (!this.iframe) {
            return;
        }

        this.hideEmptyState();

        this.iframe.src =
            this.iframe.src;
    }

    setDetecting(isDetecting) {
        const button =
            this.page?.querySelector(
                ".web-preview-detect"
            );

        if (!button) {
            return;
        }

        button.disabled =
            isDetecting;

        button.querySelector(
            ".web-preview-menu-item-left span:last-child"
        ).textContent =
            isDetecting
                ? "Scanning..."
                : "Detect Local Server";
    }

    showEmptyState() {
        /*
         * Keep the main preview clean.
         * If no server exists, simply show a blank
         * preview rather than adding another status bar.
         */
        if (!this.iframe) {
            return;
        }

        this.iframe.src =
            "about:blank";
    }

    hideEmptyState() {
        if (!this.iframe) {
            return;
        }
    }

    getSavedUrl() {
        try {
            return localStorage.getItem(
                this.storageKey
            );
        } catch {
            return null;
        }
    }

    saveUrl(url) {
        try {
            localStorage.setItem(
                this.storageKey,
                url
            );
        } catch {
            // Ignore storage errors.
        }
    }

    hideFloatingButton() {
        if (!this.floatingButton) {
            return;
        }

        this.floatingButton.style.display =
            "none";
    }

    showFloatingButton() {
        if (!this.floatingButton) {
            return;
        }

        this.floatingButton.style.display =
            "flex";
    }

    destroy() {
        this.actionStack?.remove(
            this.actionId
        );

        this.commands?.removeCommand(
            "web-preview.open"
        );

        if (this.floatingButton) {
            this.floatingButton.remove();

            this.floatingButton = null;
        }

        if (this.floatingButtonStyle) {
            this.floatingButtonStyle.remove();

            this.floatingButtonStyle =
                null;
        }

        if (this.page) {
            this.page.innerHTML = "";
        }

        this.page = null;
        this.commands = null;
        this.actionStack = null;

        this.iframe = null;
        this.urlInput = null;

        this.backButton = null;
        this.forwardButton = null;
        this.refreshButton = null;
        this.menuButton = null;
        this.closeButton = null;

        this.menu = null;
    }
}

if (window.acode) {
    const webPreview =
        new WebPreview();

    acode.setPluginInit(
        plugin.id,

        async (
            baseUrl,
            $page,
            {
                cacheFileUrl,
                cacheFile
            }
        ) => {
            webPreview.baseUrl =
                baseUrl.endsWith("/")
                    ? baseUrl
                    : `${baseUrl}/`;

            await webPreview.init(
                $page
            );
        }
    );

    acode.setPluginUnmount(
        plugin.id,

        () => {
            webPreview.destroy();
        }
    );
}