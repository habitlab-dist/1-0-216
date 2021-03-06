
  window.vaadin = window.vaadin || {};
  vaadin.elements = vaadin.elements || {};
  vaadin.elements.grid = vaadin.elements.grid || {};

  vaadin.elements.grid.Templatizer = Polymer({
    is: 'vaadin-grid-templatizer',

    factoryImpl: function(dataHost) {
      this.dataHost = dataHost;
    },

    behaviors: [Polymer.Templatizer],

    properties: {
      template: Object,

      _forwardedParentProps: Object,
      _templateInstances: Array
    },

    observers: ['_templateChanged(template)', '_forwardedParentPropsChanged(_forwardedParentProps.*, _templateInstances)'],

    created: function() {
      this._instanceProps = {
        expanded: true,
        index: true,
        item: true,
        selected: true
      };
    },

    createInstance: function() {
      var instance = this.stamp(null);
      this.addInstance(instance);

      return instance;
    },

    addInstance: function(instance) {
      if (this._templateInstances.indexOf(instance) === -1) {
        this._templateInstances.push(instance);
      }
    },

    removeInstance: function(instance) {
      var index = this._templateInstances.indexOf(instance);

      this._templateInstances.splice(index, 1);
    },

    _templateChanged: function(template) {
      this._forwardedParentProps = {};
      this._templateInstances = [];
      template.templatizer = this;
      this.templatize(template);

      // TODO: hack to avoid: https://github.com/Polymer/polymer/issues/3307
      this._parentProps = this._parentProps || {};
    },

    _forwardInstanceProp: function(inst, prop, value) {
      // fire notification event only when a prop is changed through a user-action.
      // e.g. 'expanded' is different from the originally bound '__expanded__' value.
      if (inst['__' + prop + '__'] !== undefined &&
        inst['__' + prop + '__'] !== value) {
        this.fire('template-instance-changed', {
          prop: prop,
          value: value,
          inst: inst
        });
      }
    },

    _forwardInstancePath: function(inst, path, value) {
      // TODO: assuming we're currently just listening to [[item.xxxx]] properties
      // which affect only cells on the current row.
      if (path.indexOf('item.') === 0 && !this._suppressItemChangeEvent) {
        this.fire('item-changed', {
          item: inst.item,
          // stripping 'item.' from path.
          path: path.substring(5),
          value: value
        });
      }
    },

    _forwardParentProp: function(prop, value) {
      // _forwardParentProp might be called during this.stamp() before
      // this.instance is set. We need to delay it until instance is set.
      this.set('_forwardedParentProps.' + prop, value);
    },

    _forwardParentPath: function(path, value) {
      this.set('_forwardedParentProps.' + path, value);
    },

    _forwardedParentPropsChanged: function(e, templateInstances) {
      if (e.path !== '_forwardedParentProps') {
        var prop = e.path.substring(e.path.indexOf('.') + 1);
        var value = e.value;

        templateInstances.forEach(function(inst) {
          inst.set(prop, value);
        });
      }
    }
  });
