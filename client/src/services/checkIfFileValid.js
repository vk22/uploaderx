export default function (file, type) {
	if (type === 'audio') {
		if (
			file.type !== "audio/mpeg" &&
			file.type !== "audio/aiff" &&
			file.type !== "audio/aif" &&
			file.type !== "audio/flac" &&
			file.type !== "audio/wav" &&
			file.type !== "audio/x-aiff" &&
			file.type !== "audio/x-wav" &&
			file.type !== "audio/x-m4a" &&
			file.type !== "audio/m4a"
		) {
			return false;
		} else {
			return true;
		}
	}
	if (type === 'cover') {
		if (
			file.type !== "image/jpeg" &&
			file.type !== "image/png"
		) {
			return false;
		} else {
			return true;
		}
	}

}
