var domify = require('domify');
var marked = require('marked');

var WRAPPER = '<div class="marky-wrapper"></div>';

var PREVIEW = '<div class="marky-preview"></div>';

function Preview(eventBus, config, editor) {

  this._eventBus = eventBus;
  this._editor = editor;
  this._options = config;

  var that = this;

  eventBus.on('marky.editor.init', function() {
    that._init();
  })
}

Preview.$inject = [ 'eventBus', 'config', 'editor' ];

module.exports = Preview;


Preview.prototype._init = function() {

  var container = this._options.container;

  var wrapper = container.appendChild(domify(WRAPPER));

  this.el = wrapper.appendChild(domify(PREVIEW));

  var that = this;

  this._eventBus.on('marky.editor.change', function(e) {
    that.setContent(that._editor.getContents());
  });

}

Preview.prototype.setContent = function(content) {
  this.el.innerHTML = marked(content);
}
