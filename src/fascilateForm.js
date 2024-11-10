export function fascilateForm(input) {
	input.addEventListener("focus", (ev) =>
		ev.target.parentNode.classList.add("focused")
	);
	input.addEventListener("blur", (ev) => {
		const val = ev.target.value;
		const parent = ev.target.parentNode;
		if (val === "") {
			ev.target.classList.remove("filled");
			parent.classList.remove("focused");
		} else parent.classList.add("filled");
	});
}
