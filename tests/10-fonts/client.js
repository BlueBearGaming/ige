var Client = IgeClass.extend({
	classId: 'Client',
	init: function () {
		// Load our textures
		var self = this,
			gameTexture = [];

		this.obj = [];

		gameTexture[0] = new IgeFontSheet('../assets/textures/fonts/eater_26pt.png', 0);

		// Wait for our textures to load before continuing
		ige.on('texturesLoaded', function () {
			// Create the HTML canvas
			ige.createFrontBuffer(true);

			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					var Rotator = IgeEntity.extend({
						tick: function (ctx) {
							this.rotateBy(0, 0, (0.1 * ige.tickDelta) * Math.PI / 180);
							this._super(ctx);
						}
					});

					// Create the scene
					self.scene1 = new IgeScene2d();

					// Create the main viewport
					self.vp1 = new IgeViewport()
						.autoSize(true)
						.scene(self.scene1)
						.drawBounds(true)
						.mount(ige);

					// Create an entity
					new IgeFontEntity()
						.id('font1')
						.depth(1)
						.width(480)
						.height(110)
						.texture(gameTexture[0])
						.textAlignX(0)
						.textAlignY(0)
						.textLineSpacing(-34)
						.text('Align Left / Top\nAnother Line')
						.center(0)
						.middle(0)
						.mount(self.scene1);

					new IgeFontEntity()
						.id('font2')
						.depth(1)
						.width(480)
						.height(110)
						.texture(gameTexture[0])
						.textAlignX(1)
						.textAlignY(1)
						.textLineSpacing(-34)
						.text('Align Center / Middle\nAnother Line')
						.center(0)
						.middle(110)
						.mount(self.scene1);

					new IgeFontEntity()
						.id('font3')
						.depth(1)
						.width(480)
						.height(110)
						.texture(gameTexture[0])
						.textAlignX(2)
						.textAlignY(2)
						.textLineSpacing(-34)
						.text('Align Right / Bottom\nAnother Line')
						.center(0)
						.middle(220)
						.mount(self.scene1);
				}
			});
		});
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }