import { ref } from 'vue'

export default function () {
	const files = ref([])

	function addFiles(newFiles) {
		let newUploadableFiles = [...newFiles].map((file) => new UploadableFile(file)).filter((file) => !fileExists(file.id))
		console.log('newUploadableFiles ', newUploadableFiles)
		// files.value = files.value.concat(newUploadableFiles)
		files.value = newUploadableFiles
	}

	function fileExists(otherId) {
		return files.value.some(({ id }) => id === otherId)
	}

	function removeFile(file) {
		const index = files.value.indexOf(file)
		if (index > -1) files.value.splice(index, 1)
	}

	function removeFiles() {
		files.value = []
	}

	return { files, addFiles, removeFile, removeFiles }
}

class UploadableFile {
	constructor(file) {
		this.file = file
		this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`
		this.url = URL.createObjectURL(file)
		this.status = null
	}
}