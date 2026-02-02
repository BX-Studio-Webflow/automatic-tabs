/**
 * Automatic accordion animation controller
 * Handles automatic tab cycling with smooth progress bar animations
 */

interface AccordionState {
  currentIndex: number;
  intervalId: number | null;
  animationFrameId: number | null;
}

export class AccordionController {
  private accordions: HTMLElement[] = [];
  private state: AccordionState = {
    currentIndex: 0,
    intervalId: null,
    animationFrameId: null,
  };
  private readonly TAB_DURATION = 10000; // 10 seconds in milliseconds
  private progressStartTime: number = 0;

  /**
   * Initialize the accordion controller
   */
  init(): void {
    // Get all accordion items
    const accordionElements = document.querySelectorAll('[dev-target="accordion"]');

    if (!accordionElements || accordionElements.length === 0) {
      console.error('No accordion elements found with [dev-target="accordion"]');
      return;
    }

    // Convert NodeList to Array and validate each accordion
    accordionElements.forEach((accordion, index) => {
      if (!(accordion instanceof HTMLElement)) {
        console.error(`Accordion at index ${index} is not an HTMLElement`);
        return;
      }

      // Validate required child elements
      const title = accordion.querySelector('[dev-target="accordion-title"]');
      const message = accordion.querySelector('[dev-target="accordion-message"]');

      if (!title) {
        console.error(`Accordion at index ${index} is missing [dev-target="accordion-title"]`);
        return;
      }
      if (!message) {
        console.error(`Accordion at index ${index} is missing [dev-target="accordion-message"]`);
        return;
      }

      //setup click to set active accordion
      accordion.addEventListener('click', () => {
        this.goToAccordion(index);
      });
      this.accordions.push(accordion);
    });

    if (this.accordions.length === 0) {
      console.error('No valid accordions found after validation');
      return;
    }

    // Initialize first accordion as active
    this.activateAccordion(0);

    // Start automatic cycling
    this.startAutoCycle();
  }

  /**
   * Activate a specific accordion by index
   */
  private activateAccordion(index: number): void {
    // Deactivate all accordions
    this.accordions.forEach((accordion) => {
      accordion.classList.remove('is-active');
    });

    // Activate the target accordion
    const activeAccordion = this.accordions[index];
    activeAccordion.classList.add('is-active');

    // Update state
    this.state.currentIndex = index;

    // Start progress animation
    this.startProgressAnimation();
  }

  /**
   * Start the smooth progress bar animation
   */
  private startProgressAnimation(): void {
    // Cancel any existing animation
    if (this.state.animationFrameId !== null) {
      cancelAnimationFrame(this.state.animationFrameId);
    }

    // Record start time
    this.progressStartTime = performance.now();

    // Animation loop
    const animate = (currentTime: number) => {
      const elapsed = currentTime - this.progressStartTime;
      const progress = Math.min(elapsed / this.TAB_DURATION, 1); // 0 to 1

      // Continue animation if not complete
      if (progress < 1) {
        this.state.animationFrameId = requestAnimationFrame(animate);
      }
    };

    this.state.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Start automatic cycling through accordion tabs
   */
  private startAutoCycle(): void {
    this.state.intervalId = window.setInterval(() => {
      const nextIndex = (this.state.currentIndex + 1) % this.accordions.length;
      this.activateAccordion(nextIndex);
    }, this.TAB_DURATION);
  }

  /**
   * Stop automatic cycling
   */
  stop(): void {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    if (this.state.animationFrameId !== null) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = null;
    }
  }

  /**
   * Manually go to a specific accordion index
   */
  goToAccordion(index: number): void {
    if (index < 0 || index >= this.accordions.length) {
      console.error(`Invalid accordion index: ${index}`);
      return;
    }

    // Stop and restart the auto-cycle
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
    }

    this.activateAccordion(index);
    this.startAutoCycle();
  }

  /**
   * Clean up and destroy the accordion controller
   */
  destroy(): void {
    this.stop();
    this.accordions = [];
    this.state = {
      currentIndex: 0,
      intervalId: null,
      animationFrameId: null,
    };
  }
}
