
function ajax(path, data, execute) {
	$.ajax({
		url         :   "cache/" + path,
		dataType    :   "html",/* JSON, HTML, SJONP... */
		type        :   "post", /* POST or GET; Default = GET */
		data		: 	data,
		success     :   function(response) { execute(response) }
   	})
}