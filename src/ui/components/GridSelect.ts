import { UIComponent, type CSSRule } from "../ui";

export interface GridSelectAdapter {
  isValidSession(sessionName: string): boolean;
  getOptionsCount(sessionName: string): number;
  getCover(sessionName: string, optionIndex: number): string;
  getCoverType(): CoverType;
}

type OptionSelectHandler = (sessionName: string, optionIndex: number) => void;

export type CoverType = "image" | "color";

type Session = {
  readonly name: string;
  // current page number
  pageNumber: number;
  // index of selected option
  optionIndex?: number;
  // has it ever been attached?
  hasAttached: boolean;
};

// Handle many options inside limited number of slots
export default class GridSelect extends UIComponent<"div"> {
  static #instanceCount = 0;

  static #GRID_CLASSNAME = "grid-select";
  static #GRID_ATTRIBUTE = "data-grid";
  static #SESSION_ATTRIBUTE = "data-session";
  static #PAGE_ATTRIBUTE = "data-page";
  static #SLOT_CLASSNAME = "grid-select-slot";
  static #SLOT_POSITION_ATTR = "data-position";

  #id: number;
  #slotsCount: number;
  #sessions: Record<string, Session> = {};
  #session: Session;
  #adapter: GridSelectAdapter;

  #pagesNav?: HTMLElement;
  #nextPageBtn?: HTMLButtonElement;
  #prevPageBtn?: HTMLButtonElement;

  onOptionSelect?: OptionSelectHandler;

  constructor(slotsCount: number, gridInterface: GridSelectAdapter) {
    super("div", GridSelect.#GRID_CLASSNAME);
    this.#id = GridSelect.#instanceCount++;
    this.#slotsCount = slotsCount;
    this.#adapter = gridInterface;
    this.#session = {
      name: "default-session",
      pageNumber: 0,
      hasAttached: false,
    };
  }

  attachSession(sessionName: string) {
    if (!this.#adapter.isValidSession(sessionName)) {
      return;
    }
    this.#session = this.#getOrCreateSession(sessionName);
    if (!this.#session.hasAttached) {
      this.#resolveCovers(sessionName);
    }
    this.#session.hasAttached = true;
    this.#updateState();
  }

  markOptionSelected(sessionName: string, optionIndex: number) {
    if (!this.#adapter.isValidSession(sessionName)) {
      return;
    }
    const session = this.#getOrCreateSession(sessionName);
    session.optionIndex = optionIndex;
    if (sessionName === this.#session.name) {
      this.#updateState();
    }
  }

  #getOrCreateSession(name: string) {
    this.#sessions[name] ??= {
      name: name,
      pageNumber: 0,
      hasAttached: false,
    };
    return this.#sessions[name];
  }

  #handleSlotClick(event: MouseEvent) {
    const slot = event.currentTarget as HTMLButtonElement;
    const slotPosition = parseInt(
      slot.getAttribute(GridSelect.#SLOT_POSITION_ATTR) ?? "0"
    );
    const optionIndexToSelect =
      this.#session?.pageNumber * this.#slotsCount + slotPosition;
    if (optionIndexToSelect > this.#maxOptionIndex) {
      return;
    }
    this.#session.optionIndex = optionIndexToSelect;
    this.#updateState();
    this.onOptionSelect?.(this.#session.name, this.#session.optionIndex);
  }

  #updateState() {
    const { name, pageNumber, optionIndex } = this.#session;
    this.element.setAttribute(GridSelect.#SESSION_ATTRIBUTE, name);
    this.element.setAttribute(
      GridSelect.#PAGE_ATTRIBUTE,
      pageNumber.toString()
    );

    this.#selectedSlot?.removeAttribute("data-selected");
    if (undefined !== optionIndex) {
      const optionPage = Math.floor(optionIndex / this.#slotsCount);
      if (optionPage === pageNumber) {
        const positionToSelect = optionIndex % this.#slotsCount;
        const slotToSelect = this.#findSlot(positionToSelect);
        slotToSelect?.setAttribute("data-selected", "");
      }
    }

    if (pageNumber >= this.#lastPageNumber) {
      this.#nextPageBtn?.setAttribute("disabled", "");
    } else {
      this.#nextPageBtn?.removeAttribute("disabled");
    }

    if (pageNumber <= 0) {
      this.#prevPageBtn?.setAttribute("disabled", "");
    } else {
      this.#prevPageBtn?.removeAttribute("disabled");
    }

    if (this.#prevPageBtn?.disabled && this.#nextPageBtn?.disabled) {
      this.#pagesNav?.setAttribute("data-disabled", "");
    } else {
      this.#pagesNav?.removeAttribute("data-disabled");
    }
  }

  get #maxOptionIndex(): number {
    const optionsCount = this.#adapter.getOptionsCount(this.sessionName);
    return optionsCount - 1;
  }

  get #lastPageNumber(): number {
    const optionsCount = this.#adapter.getOptionsCount(this.sessionName);
    return Math.ceil(optionsCount / this.#slotsCount) - 1;
  }

  get selectedOptionIndex(): number {
    return this.#session.optionIndex ?? -1;
  }

  get sessionName() {
    return this.#session.name;
  }

  render(): HTMLDivElement {
    this.element.setAttribute(GridSelect.#GRID_ATTRIBUTE, this.#id.toString());

    const slotsLayout = this.#createSlotsLayout();
    this.element.appendChild(slotsLayout);

    for (let p = 0; p < this.#slotsCount; p++) {
      const slot = this.#createSlot(p);
      slot.addEventListener("click", (event) => this.#handleSlotClick(event));
      slotsLayout.appendChild(slot);
    }

    const nav = this.#createPagesNav();
    this.element.appendChild(nav);

    return this.element;
  }

  #resolveCovers(sessionName: string) {
    const optionsCount = this.#adapter.getOptionsCount(sessionName);
    for (let i = 0; i < optionsCount; i++) {
      const optionIndex = i;
      const cover = this.#adapter.getCover(sessionName, optionIndex);
      this.#addCover(
        sessionName,
        this.#adapter.getCoverType(),
        optionIndex,
        cover
      );
    }
  }

  #addCover(
    sessionName: string,
    type: CoverType,
    optionIndex: number,
    value: string
  ) {
    const rule = {
      selector: "",
      properties: {} as Record<string, string>,
    } satisfies CSSRule;

    if ("color" === type) {
      rule.properties["--cover-color"] = value;
    } else if ("image" === type) {
      rule.properties["--cover-image"] = value.startsWith("var")
        ? value // css variable
        : `url(${encodeURI(value)})`;
      rule.properties["--cover-color"] = "var(--grid-select-slot-cover-color)";
    }

    const page = Math.floor(optionIndex / this.#slotsCount);
    const slotPosition = optionIndex % this.#slotsCount;

    rule.selector =
      `.${GridSelect.#GRID_CLASSNAME}` +
      `[${GridSelect.#GRID_ATTRIBUTE}="${this.#id}"]` +
      `[${GridSelect.#SESSION_ATTRIBUTE}="${sessionName}"]` +
      `[${GridSelect.#PAGE_ATTRIBUTE}="${page}"]` +
      " " +
      `.${GridSelect.#SLOT_CLASSNAME}` +
      `[${GridSelect.#SLOT_POSITION_ATTR}="${slotPosition}"]`;

    this._style.addRule(rule);
  }

  #createSlot(position: number): HTMLButtonElement {
    const slot = document.createElement("button");
    slot.type = "button";
    slot.classList.add(GridSelect.#SLOT_CLASSNAME);
    slot.setAttribute(GridSelect.#SLOT_POSITION_ATTR, position.toString());
    return slot;
  }

  #findSlot(slotPosition: number) {
    return this.element.querySelector(
      `.${GridSelect.#SLOT_CLASSNAME}` +
        `[${GridSelect.#SLOT_POSITION_ATTR}="${slotPosition}"]`
    );
  }

  get #selectedSlot() {
    return this.element.querySelector(
      `.${GridSelect.#SLOT_CLASSNAME}` + `[data-selected]`
    );
  }

  #createSlotsLayout() {
    const slotsLayout = document.createElement("main");
    slotsLayout.classList.add("grid-select-slots");
    return slotsLayout;
  }

  #createPagesNav() {
    this.#nextPageBtn = this.#createNextPageButton();
    this.#prevPageBtn = this.#createPrevPageButton();
    this.#pagesNav = document.createElement("nav");
    this.#pagesNav.classList.add("grid-select-pages");
    this.#pagesNav.appendChild(this.#prevPageBtn);
    this.#pagesNav.appendChild(this.#nextPageBtn);
    return this.#pagesNav;
  }

  #createNextPageButton(): HTMLButtonElement {
    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.classList.add("grid-select-page-btn");
    nextBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 grid-select-page-btn-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>`;
    nextBtn.addEventListener("click", () => {
      const { pageNumber } = this.#session;
      if (pageNumber < this.#lastPageNumber) {
        this.#session.pageNumber++;
        this.#updateState();
      }
    });
    return nextBtn;
  }

  #createPrevPageButton(): HTMLButtonElement {
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.classList.add("grid-select-page-btn");
    prevBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 grid-select-page-btn-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>`;
    prevBtn.addEventListener("click", () => {
      const { pageNumber } = this.#session;
      if (pageNumber > 0) {
        this.#session.pageNumber--;
        this.#updateState();
      }
    });
    return prevBtn;
  }

  get name() {
    return `grid-select_${this.#id}`;
  }
}
