/*
 * We extend here the String functionality by providing a
 * format function that allows to do something similar to
 * printf. This helps to keep the code cleaner avoiding
 * a lot of string concatenations. It can be used as:
 *
 * "The value of {0} is {1}".format(someVar, someOtherVar).
 */
String.prototype.format = function() 
{
	var result = this;
	for (var ix = 0; ix < arguments.length; ix++) 
	{
		var tagRegExp = new RegExp("\\{" + ix + "\\}", "gi");
		result = result.replace(tagRegExp, arguments[ix]);
	}
	return result;
};
