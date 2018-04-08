
  window.vaadin = window.vaadin || {};
  vaadin.elements = vaadin.elements || {};
  vaadin.elements.grid = vaadin.elements.grid || {};

  /**
   * @polymerBehavior vaadin.elements.grid.ColumnBaseBehavior
   */
  vaadin.elements.grid.ColumnBaseBehavior = {
    properties: {

      /**
       * When set to true, the column is user-resizable.
       * @default false
       */
      resizable: {
        type: Boolean,
        value: function() {
          if (this.localName === 'vaadin-grid-column-group') {
            return;
          }

          var parent = Polymer.dom(this).parentNode;
          if (parent && parent.localName === 'vaadin-grid-column-group') {
            return parent.resizable || false;
          } else {
            return false;
          }
        }
      },

      /**
       * @private
       */
      headerTemplate: {
        type: Object,
        value: function() {
          return this._findTemplate('template.header') || null;
        }
      },

      /**
       * @private
       */
      footerTemplate: {
        type: Object,
        value: function() {
          return this._findTemplate('template.footer') || null;
        }
      },

      /**
       * When true, the column is frozen. When a column inside of a column group is frozen,
       * all of the sibling columns inside the group will get frozen also.
       */
      frozen: {
        type: Boolean,
        notify: true,
        value: false
      },

      /**
       * When set to true, the cells for this column are hidden.
       */
      hidden: {
        type: Boolean,
        notify: true
      },

      _lastFrozen: {
        type: Boolean,
        notify: true,
        value: false
      },

      _order: Number,

      _reorderStatus: Boolean
    },

    observers: [
      '_footerTemplateChanged(footerTemplate)',
      '_headerTemplateChanged(headerTemplate)',
      '_lastFrozenChanged(_lastFrozen)'
    ],

    _selectFirstTemplate: function(selector) {
      return Polymer.dom(this).querySelectorAll(selector).filter(function(el) {
        return el.parentElement === this;
      }.bind(this))[0];
    },

    _findTemplate: function(selector) {
      var template = this._selectFirstTemplate(selector);
      if (template) {
        if (this.dataHost) {
          // set dataHost to the context where template has been defined
          template._rootDataHost = this.dataHost._rootDataHost || this.dataHost;
        }
      }
      return template;
    },

    _headerTemplateChanged: function(headerTemplate) {
      if (headerTemplate) {
        var templatizer = new vaadin.elements.grid.Templatizer(this.dataHost);
        templatizer._instanceProps = {};
        templatizer.template = headerTemplate;
      }

      this.fire('property-changed', {path: 'headerTemplate', value: headerTemplate});
    },

    _footerTemplateChanged: function(footerTemplate) {
      if (footerTemplate) {
        var templatizer = new vaadin.elements.grid.Templatizer(this.dataHost);
        templatizer._instanceProps = {};
        templatizer.template = footerTemplate;
      }

      this.fire('property-changed', {path: 'footerTemplate', value: footerTemplate});
    },

    _flexGrowChanged: function(flexGrow) {
      this.fire('property-changed', {path: 'flexGrow', value: flexGrow});
    },

    _widthChanged: function(width) {
      this.fire('property-changed', {path: 'width', value: width});
    },

    _lastFrozenChanged: function(lastFrozen) {
      this.fire('property-changed', {path: 'lastFrozen', value: lastFrozen});
    }
  };

  /**
   * @polymerBehavior vaadin.elements.grid.ColumnBehaviorImpl
   */
  vaadin.elements.grid.ColumnBehaviorImpl = {
    properties: {
      /**
       * Width of the cells for this column.
       */
      width: {
        type: String,
        value: '100px'
      },

      /**
       * Flex grow ratio for the cell widths. When set to 0, cell width is fixed.
       */
      flexGrow: {
        type: Number,
        value: 1
      },

      /**
       * @private
       */
      template: {
        type: Object,
        value: function() {
          return this._findTemplate('template:not(.header):not(.footer)');
        }
      },

    },

    observers: [
      '_flexGrowChanged(flexGrow)',
      '_widthChanged(width)',
      '_templateChanged(template)',
      '_frozenChanged(frozen, isAttached)',
      '_hiddenChanged(hidden)',
      '_orderChanged(_order)',
      '_reorderStatusChanged(_reorderStatus)',
      '_resizableChanged(resizable)'
    ],

    _frozenChanged: function(frozen, isAttached) {
      // since `frozen` is defined in ColumnBaseBehavior, this observer is triggered
      // normally before the column is actually attached to the DOM.
      // For events to bubble in Safari 9, element needs to be attached.
      if (isAttached) {
        this.fire('property-changed', {path: 'frozen', value: frozen});
      }
    },

    _templateChanged: function(template) {
      var templatizer = new vaadin.elements.grid.Templatizer(this.dataHost);

      // body cell templatizer needs to be attached so that `item-changed` and
      // `template-instance-changed` events propagate to grid.
      Polymer.dom(this.root).appendChild(templatizer);

      templatizer.template = template;

      // We bubble false for optimisation
      this.fire('property-changed', {path: 'template', value: template}, {bubbles: false});
    },

    _hiddenChanged: function(hidden) {
      this.fire('property-changed', {path: 'hidden', value: hidden});
    },

    _orderChanged: function(order) {
      this.fire('property-changed', {path: 'order', value: order});
    },

    _reorderStatusChanged: function(reorderStatus) {
      this.fire('property-changed', {path: 'reorderStatus', value: reorderStatus});
    },

    _resizableChanged: function(resizable) {
      this.fire('property-changed', {path: 'resizable', value: resizable});
    },
  };

  /**
   * @polymerBehavior vaadin.elements.grid.ColumnBehavior
   */
  vaadin.elements.grid.ColumnBehavior = [
    vaadin.elements.grid.ColumnBaseBehavior,
    vaadin.elements.grid.ColumnBehaviorImpl
  ];

    Polymer({
      is: 'vaadin-grid-column',

      behaviors: [vaadin.elements.grid.ColumnBehavior]
    });
  