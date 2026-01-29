import './styles/accordion-animations.css';

import { AccordionController } from '$utils/accordion-animation';

window.Webflow ||= [];
window.Webflow.push(() => {
  // Initialize automatic accordion
  const accordionController = new AccordionController();
  accordionController.init();
});
