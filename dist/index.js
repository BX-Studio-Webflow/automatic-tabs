"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/utils/accordion-animation.ts
  var AccordionController = class {
    accordions = [];
    state = {
      currentIndex: 0,
      intervalId: null,
      animationFrameId: null
    };
    TAB_DURATION = 1e4;
    // 10 seconds in milliseconds
    progressStartTime = 0;
    /**
     * Initialize the accordion controller
     */
    init() {
      const accordionElements = document.querySelectorAll('[dev-target="accordion"]');
      if (!accordionElements || accordionElements.length === 0) {
        console.error('No accordion elements found with [dev-target="accordion"]');
        return;
      }
      accordionElements.forEach((accordion, index) => {
        if (!(accordion instanceof HTMLElement)) {
          console.error(`Accordion at index ${index} is not an HTMLElement`);
          return;
        }
        const title = accordion.querySelector('[dev-target="accordion-title"]');
        const message = accordion.querySelector('[dev-target="accordion-message"]');
        const track = accordion.querySelector('[dev-target="accordion-animation-track"]');
        const fill = accordion.querySelector('[dev-target="accordion-animation-fill"]');
        if (!title) {
          console.error(`Accordion at index ${index} is missing [dev-target="accordion-title"]`);
          return;
        }
        if (!message) {
          console.error(`Accordion at index ${index} is missing [dev-target="accordion-message"]`);
          return;
        }
        if (!track) {
          console.error(
            `Accordion at index ${index} is missing [dev-target="accordion-animation-track"]`
          );
          return;
        }
        if (!fill) {
          console.error(
            `Accordion at index ${index} is missing [dev-target="accordion-animation-fill"]`
          );
          return;
        }
        this.accordions.push(accordion);
      });
      if (this.accordions.length === 0) {
        console.error("No valid accordions found after validation");
        return;
      }
      this.activateAccordion(0);
      this.startAutoCycle();
    }
    /**
     * Activate a specific accordion by index
     */
    activateAccordion(index) {
      this.accordions.forEach((accordion) => {
        const fill = accordion.querySelector(
          '[dev-target="accordion-animation-fill"]'
        );
        if (fill) {
          fill.style.width = "0%";
        }
        accordion.classList.remove("is-active");
      });
      const activeAccordion = this.accordions[index];
      activeAccordion.classList.add("is-active");
      this.state.currentIndex = index;
      this.startProgressAnimation();
    }
    /**
     * Start the smooth progress bar animation
     */
    startProgressAnimation() {
      if (this.state.animationFrameId !== null) {
        cancelAnimationFrame(this.state.animationFrameId);
      }
      const activeAccordion = this.accordions[this.state.currentIndex];
      const fill = activeAccordion.querySelector(
        '[dev-target="accordion-animation-fill"]'
      );
      if (!fill) return;
      this.progressStartTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - this.progressStartTime;
        const progress = Math.min(elapsed / this.TAB_DURATION, 1);
        const percentage = progress * 100;
        fill.style.width = `${percentage}%`;
        if (progress < 1) {
          this.state.animationFrameId = requestAnimationFrame(animate);
        }
      };
      this.state.animationFrameId = requestAnimationFrame(animate);
    }
    /**
     * Start automatic cycling through accordion tabs
     */
    startAutoCycle() {
      this.state.intervalId = window.setInterval(() => {
        const nextIndex = (this.state.currentIndex + 1) % this.accordions.length;
        this.activateAccordion(nextIndex);
      }, this.TAB_DURATION);
    }
    /**
     * Stop automatic cycling
     */
    stop() {
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
    goToAccordion(index) {
      if (index < 0 || index >= this.accordions.length) {
        console.error(`Invalid accordion index: ${index}`);
        return;
      }
      if (this.state.intervalId !== null) {
        clearInterval(this.state.intervalId);
      }
      this.activateAccordion(index);
      this.startAutoCycle();
    }
    /**
     * Clean up and destroy the accordion controller
     */
    destroy() {
      this.stop();
      this.accordions = [];
      this.state = {
        currentIndex: 0,
        intervalId: null,
        animationFrameId: null
      };
    }
  };

  // src/index.ts
  window.Webflow ||= [];
  window.Webflow.push(() => {
    const accordionController = new AccordionController();
    accordionController.init();
  });
})();
//# sourceMappingURL=index.js.map
