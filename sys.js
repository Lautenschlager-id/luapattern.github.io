function normalize(t) {
	return t.replace(/"/g, "\\\"").replace(/'/g, "\\'").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}

function contentChanged(){
	var pattern = document.getElementById("pattern");
	var content = document.getElementById("content");
	var match = document.getElementById("matched");
	var counter = document.getElementById("counter");

	try
	{
		var lua = fengari.load(`
local str = "` + normalize(content.value) + `"
local pattern = "` + normalize(pattern.value) + `"

local matches, counter = { }, 0

local i, e = 1, 0
local last_i, last_e = 0, 0

local len, f = #str

while true do
    counter = counter + 1
    f = len - (len - last_e)
    i, e = string.find(string.sub(str, f + 1), pattern)
    if not i or not e or e == last_e then
        break
    end

    last_i, last_e = f + i, f + e
    matches[counter] = { last_i, last_e, (string.sub(str, last_i, last_e)) }
end

return { len = counter - 1, matches = matches }
`)();
		let obj, len = lua.get("len");
		if (len == 0)
			throw null;

		var tbl = "<table>";
		for (let index = 1; index <= len; index++)
		{
			obj = lua.get("matches").get(index);
			obj = "<tr><th><i>[" + obj.get(1) + ":" + obj.get(2) + "]</i></th><th>" + (obj.get(3).replace(/</g, "&lt;")) + "</th></tr>";

			tbl += obj;
		}
		tbl += "</table>"

		match.innerHTML = tbl;
		autosize(match);
		
		counter.innerHTML = "* " + len + " matches found";
	}
	catch(_)
	{
		counter.innerHTML = match.innerHTML = "";
	}
}

function autosize(textarea){
	textarea.style.height = "auto";
	
	var height = textarea.scrollHeight - 5;
	if (height > 300)
		textarea.style.overflow = "auto";

	textarea.style.height = Math.min(300, height) + "px";
}