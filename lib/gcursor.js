(function (window) {

var gcursor = {};

gcursor.mapping = {
  'standard': {
    cursorX: 0,
    cursorY: 1,
    cursorDown: 11
  }
};

gcursor.getMapping = function (gamepad) {
  if (gamepad.id in gcursor.mapping) {
    return gcursor.mapping[gamepad.id];
  } else {
    return gcursor.mapping.standard;
  }
};

gcursor.axis2key = function (gamepad, axis) {
  var mapping = gcursor.getMapping(gamepad);
  if (axis === mapping.cursorX) {
    return 'x';
  } else if (axis === mapping.cursorY) {
    return 'y';
  }
};

gcursor.buttonEvent2axisEvent = function (e) {
  if (e.type === 'gamepadbuttondown') {
    e.axis = e.button;
    e.value = 1.0;
  } else if (e.type === 'gamepadbuttonup') {
    e.axis = e.button;
    e.value = 0.0;
  }
  return e;
};

gcursor.SMOOTHING_FACTOR = 0.5;

gcursor.active = false;
gcursor.cursor = null;
gcursor.real = {x: 0.0, y: 0.0};
gcursor.dest = {x: 0.0, y: 0.0};
gcursor.mouse = {x: 0.0, y: 0.0};
gcursor.pressed = false;

gcursor.style = `
.cursor-active {
  cursor: none;
  user-select: none;
}

.cursor {
  background: rgba(0,255,255,.25);
  border: 5px solid rgba(0,0,0,.25);
  border-radius: 25px;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: 50px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  z-index: 99999;
}
`;

gcursor.init = function (opts) {
  opts = opts || {};
  gcursor.mouse = opts.mouse;

  var style = document.createElement('style');
  style.innerHTML = gcursor.style;
  document.head.appendChild(style);

  var div = document.createElement('div');
  div.id = 'cursor';
  div.className = 'cursor';
  document.body.appendChild(div);

  gcursor.cursor = div;

  gcursor.reset();
};

gcursor.reset = function () {
  gcursor.putCursor(0, 0);
};

gcursor.stop = function () {
  gcursor.active = false;

  document.documentElement.classList.remove('cursor-active');
  gcursor.real.x = gcursor.dest.x;
  gcursor.real.y = gcursor.dest.y;

  gcursor.putCursor(gcursor.real.x, gcursor.real.y);
};

gcursor.start = function (gamepad, axis, value) {
  gcursor.dest[gcursor.axis2key(gamepad, axis)] = value;

  if (!gcursor.active) {
    document.documentElement.classList.add('cursor-active');

    gcursor.loop();
  }
};

gcursor.putCursor = function (x, y) {
  // Map to 0..1 range.
  x = (x + 1) / 2;
  y = (y + 1) / 2;

  gcursor.cursor.style.top = (y * 100) + '%';
  gcursor.cursor.style.left = (x * 100) + '%';
};

gcursor.loop = function () {
  gcursor.active = true;

  gcursor.real.x = (
    gcursor.dest.x * gcursor.SMOOTHING_FACTOR +
    gcursor.real.x * (1 - gcursor.SMOOTHING_FACTOR)
  );

  gcursor.real.y = (
    gcursor.dest.y * gcursor.SMOOTHING_FACTOR +
    gcursor.real.y * (1 - gcursor.SMOOTHING_FACTOR)
  );

  gcursor.putCursor(gcursor.real.x, gcursor.real.y);

  var dx = gcursor.dest.x - gcursor.real.x;
  var dy = gcursor.dest.y - gcursor.real.y;

  gcursor.distance = Math.sqrt(dx * dx + dy * dy);

  // Move reticle.
  gcursor.mouse.x = gcursor.real.x;
  gcursor.mouse.y = -gcursor.real.y;

  if (gcursor.distance > 0.0005) {
    window.requestAnimationFrame(gcursor.loop);
  } else {
    gcursor.stop();
  }
};

gcursor.onGamepadAxisMove = function (e) {
  e = gcursor.buttonEvent2axisEvent(e);

  var mapping = gcursor.getMapping(e.gamepad);
  if (e.axis !== mapping.cursorX && e.axis !== mapping.cursorY) {
    return;
  }

  gcursor.start(e.gamepad, e.axis, e.value);
};

gcursor.onGamepadButtonDown = function (e) {
  var mapping = gcursor.getMapping(e.gamepad);
  if (e.button !== mapping.cursorDown) {
    return;
  }

  gcursor.pressed = true;
};

gcursor.onGamepadButtonUp = function (e) {
  var mapping = gcursor.getMapping(e.gamepad);
  if (e.button !== mapping.cursorDown) {
    return;
  }

  gcursor.pressed = false;
};

window.gcursor = gcursor;

})(window);
