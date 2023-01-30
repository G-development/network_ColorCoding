import { initialProperties, template, definition, controller, paint, resize } from "./methods"

window.define(["../repositoryNTT/lib/async-fun/promise-navigation", 'qlik'], function (fun, qlik) {
	qlik.fun = fun;
	return {
		initialProperties,
		template,
		definition,
		controller,
		paint,
		resize,
	}
})