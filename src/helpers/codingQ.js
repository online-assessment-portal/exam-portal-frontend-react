// Extract Default-Code
function extractDefCode(ques, crntLangId) {
	let crntDefCode;
	const foundAt = ques[4].indexOf(crntLangId);
	if (foundAt > -1) crntDefCode = ques[6][foundAt];
	else crntDefCode = ques[6][0];
	return crntDefCode;
}
export { extractDefCode };
