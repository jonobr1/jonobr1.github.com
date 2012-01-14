define([
  'underscore',
  'jquery',
  'enhance.animate',
  'backbone'
], function() {

  var THRESHOLD = 10;
  var animating = false;

  var View = Backbone.View.extend({

    tagName: 'div',

    initialize: function() {

      if (_.isUndefined(this.options.container)) {
        this.container = document.body;
      } else {
        this.container = this.options.container;
      }

      this.model.bind('change', this.render, this);
      this.distance = 0;
      this.className = 'post ' + this.model.get('tags').toString().replace(/\,/g, ' ');
      this.el.setAttribute('class', this.className);
      this.model.set({ view: this }, { silent: true });

      var index = this.model.collection.indexOf(this.model);
      var pindex;

      if (index <= 0 && this.model.collection.length > 1) {
        // We're going into the future.
        pindex = index + 1;
      } else {
        // We're going into the past.
        pindex = index - 1;
      }

      if (pindex >= 0) {
        var prev = this.model.collection.at(pindex);
        this.distance = Math.abs(timeDelta(this.model.get('date'), prev.get('date')));
        if (this.distance < THRESHOLD) {
          this.packet = prev.get('view').packet;
        }
      }

      if (_.isUndefined(this.packet)) {

        this.packet = $('<div />')
          .css({
            position: 'relative'
          })[0];

          if (pindex > index) {
            this.packet.setAttribute('class', 'packet future');
            this.packet.style.marginBottom = this.distance + 'px';
            this.container.insertBefore(this.packet, this.container.firstChild);
          } else {
            this.packet.setAttribute('class', 'packet past');
            this.packet.style.marginTop = this.distance + 'px';
            this.container.appendChild(this.packet);
          }
      }

      if (pindex > index) {
        $(this.el).prependTo(this.packet);
      } else {
        $(this.el).appendTo(this.packet);
      }

    },

    render: function() {
      var $container = prepAnimation();
      animateIn($container, this.el, template(this.model.toJSON()),
        this.packet, this.options.complete);
      return this;
    }

  });

  function prepAnimation() {
    return $('<div class="temp-container"/>')
      .css({
        position: 'absolute',
        top: 0,
        left: -9999
      })
      .appendTo('body');
  }

  function animateIn($container, el, html, packet, callback) {

    // Animate in
    var $children = $container
      .html(html)
      .children();

    if ($children.length > 0) {
      $children
        .find('img')
        .load(function() {
          handling = false;
          handleAnimation($container, el, $children, packet, callback);
        });
    } else {
      callback.call(this);
    }
  }

  function handleAnimation($container, el, $children, packet, callback) {

    if (animating) {
      setTimeout(handleAnimation, 100, $container, el, $children, packet, callback);
      return;
    }

    animating = true;

    var $packet = $(packet);
    var w = $children.width();
    var h = $children.find('img').height();

    var $el = $(el) // Pretty much run prep from jquery.stalactite.js
      .css({
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
        opacity: 0,
        zIndex: -1
      })
      .addClass('image-loaded');

    var prevWidth = 0;
    $prevs = $packet.find('.post');

    // Possibly clean up?                // a threshold...
    for (var i = $prevs.length - 1; i >= Math.max(0, $prevs.length - 10); i--) {
      var $prev = $prevs.eq(i);
      if ($prev.position().top === $el.position().top) {
        $prev.addClass('stalactite-loaded');
        prevWidth += $prev.outerWidth();
      } else {
        continue;
      }
    }

    var x1 = prevWidth + $el.outerWidth() + w;

    $children
      .appendTo(el);

    if (x1 > $packet.width()) {
      $children
        .children()
        .width(w);
    } else {
      $children
        .children()
        .width(0);
    }

    $children
      .children()
      .height(0)  // Smarter height detection?
      .animate({
        width: w,
        height: h
      }, 150, function() {
        animating = false;
        callback.call(this);
      });

  }

  function timeDelta(cur, ref) {
    return Math.round((ref - cur) / 60); // cur and ref are in seconds
  }

  function template(o) {

    switch(o.asset_type) {
      case 'image':
        var href = o.content.stash;
        if (!href) {
          href = o.content.full;
        }
        return '<a href="' + o.source + '" target="_blank"><img src="' + href + '" alt="' + o.title + '"/></a>';
        break;
      case 'embed':
        // return o.content.info.html;
        return '';
        break;
      case 'page':
        return '<a href="' + o.source + '" target="_blank"><img src="' + o.content.thumb + '" alt="' + o.title + '"/></a>';
        break;
      default:
        return '';
    }
  }

  return View;

});