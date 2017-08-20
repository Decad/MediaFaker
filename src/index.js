import elementResizeDetector from 'element-resize-detector';
import isElement from 'iselement';
import mediaQuery from 'css-mediaquery';
import raf from 'raf';

export default class MediaFaker {
  constructor(options) {
    this.parseStyles.bind(this);
    this.appendStyle.bind(this);
    this.options = options;
    this.breakpoints = {};

    if (isElement(options.element)) {
      this.element = options.element;
    } else {
      this.element = document.querySelector(options.element);
    }

    this.parseStyles();

    this.erd = elementResizeDetector({
      strategy: 'scroll'
    });
    this.erd.listenTo(this.element, el => this.onResize(el));
  }

  parseStyles() {
    const toDelete = [];

    for (let [sheetIndex, stylesheet] of Array.prototype.entries.call(document.styleSheets)) {
      let deletionCount = 0;

      for (let [ruleIndex, rule] of Array.prototype.entries.call(stylesheet.rules)) {
        if (rule instanceof CSSMediaRule) {
          const classname = this.classify(rule.conditionText);

          if (!classname) continue;
          toDelete.push({ s: sheetIndex, r: ruleIndex - deletionCount });
          deletionCount++;
          if (!this.breakpoints[classname]) {
            this.breakpoints[classname] = {
              conditionText: rule.conditionText,
              cssText: []
            };
          }

          for (let childRule of rule.cssRules) {
            this.breakpoints[classname].cssText.push(`.${classname} ${childRule.cssText}`);
          }
        }
      }
    }
    this.appendStyle();
    this.deleteMediaQueries(toDelete);
  }

  appendStyle() {
    const style = document.createElement('style');

    const cssText = Object.keys(this.breakpoints).reduce((text, key) => {
      const ct = this.breakpoints[key].cssText.join('\n');

      return `${text}\n${ct}\n`;
    }, '');

    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssText));
    document.head.appendChild(style);
  }

  deleteMediaQueries(deleteQueue) {
    console.log(deleteQueue);
    for (let item of deleteQueue) {
      document.styleSheets[item.s].deleteRule(item.r);
    }
  }

  classify(condition) {
    const ast = mediaQuery.parse(condition);

    return ast.reduce((className, b) => {
      return b.expressions.reduce((cn, exp) => {
        return `${exp.modifier}-${exp.feature}--${exp.value}`;
      }, '');
    }, '');
  }

  onResize(el) {
    if (this._raf) return;
    const boundingRect = el.getBoundingClientRect();

    this._raf = raf(() => {
      for (let b in this.breakpoints) {
        if (this.breakpoints.hasOwnProperty(b)) {
          let breakpoint = this.breakpoints[b];

          if (mediaQuery.match(breakpoint.conditionText, { width: boundingRect.width, type: 'screen' })) {
            this.element.classList.add(b);
          } else {
            this.element.classList.remove(b);
          }
        }
      }
      this._raf = null;
    });
  }
}
