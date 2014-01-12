document.addEventListener("DOMContentLoaded", function() {
	GameCore.setScreen(new GameScreen(GameCore, new NTurnRules(10)));
	GameCore.start();
});
