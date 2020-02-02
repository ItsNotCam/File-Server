function send_file() {
	document.getElementById('file_upload').form.submit();
}

function update_filename() {
	const filename = document.getElementById('file_upload').files[0].name;

	var filename_label = document.getElementById('filename_label');
	filename_label.innerHTML = filename;
	filename_label.classList.remove('text-light');
	filename_label.classList.add('text-white');

	var button = document.getElementById('file_upload_button');
	button.disabled = false;
	button.classList.remove('disabled');
	button.classList.add('btn-info');
}

document.getElementById('dirname').addEventListener('keyup', function() {
	const text = document.getElementById('dirname').value;
	const create_btn = document.getElementById('create_dir');
	if (text.length > 0) {
		create_btn.disabled = false;
		create_btn.classList.remove('disabled');
		create_btn.classList.remove('btn-secondary');
		create_btn.classList.add('btn-info');
	} else {
		create_btn.disabled = true;
		create_btn.classList.add('disabled');
		create_btn.classList.remove('btn-info');
		create_btn.classList.add('btn-secondary');
	}
});
