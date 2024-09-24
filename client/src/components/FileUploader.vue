<template>
	<div class="file-uploader-container">
		<DropZone class="drop-area" @files-dropped="filesDropped" #default="{ dropZoneActive }">
			<label for="file-input" >
				<span v-if="dropZoneActive">
					<span>Drop here</span>
				</span>
				<span v-else class="drop-area-label">
					<div class="label-title">
						<span class="link">Choose file</span><span> or drag&drop</span>
					</div>
					<div class="label-subtitle" v-if="type === 'audio'">AIFF, FLAC, WAV, M4A, MP3, WMA</div>
					<div class="label-subtitle" v-if="type === 'cover'">JPG, PNG</div>
				</span>

				<input type="file" id="file-input" multiple @change="onInputChange" />
			</label>
			<!-- <ul class="image-list" v-show="files.length">
				<FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
			</ul> -->
		</DropZone>
		<!-- <button @click.prevent="uploadFiles(files)" class="upload-button">Upload</button> -->
	</div>
</template>

<script setup>
import { defineExpose, defineProps } from 'vue';
defineProps({
	type: { type: String, default: 'audio' }
})
import DropZone from './DropZone.vue'
import FilePreview from './FilePreview.vue'
const emit = defineEmits(['files-dropped2'])

// File Management
import useFileList from '../services/file-list'
const { files, addFiles, removeFile, removeFiles } = useFileList()

function filesDropped(files) {
	addFiles(files)
	emit('files-dropped2', files[0])
}

function onInputChange(e) {
	// console.log('e.target.files ', e.target.files)
	addFiles(e.target.files)
	e.target.value = null // reset so that selecting the same file again will still cause it to fire this change
	emit('files-dropped2', files._rawValue[0].file)
}


// Uploader
import createUploader from '../services/file-uploader'
const { uploadFiles } = createUploader()


/// handler from Parent
const startUpload = async () => {
	const response = await uploadFiles(files._rawValue)
	console.log('response ', response[0].ok)
	removeFiles()
	if (response[0].ok) {
		return true
	}
}

defineExpose({ startUpload });
</script>

<style lang="scss">

.file-uploader-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
}
.drop-area {
	width: 100%;
	max-width: 100%;
	margin: 0 auto;
	padding: 2rem;
	background: rgba(255,255,255,0.333);
	transition: 0.2s ease;
    border: 2px dashed #bbbbbb;
    border-radius: 1rem;
	height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.drop-area[data-active=true] {
	border: 2px dashed #ffb133;
}
.drop-area-label {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	.label-title {
		font-size: 1.5rem;
		font-weight: 300;
		margin-bottom: 1rem;
	}

	.label-subtitle {
		font-size: .95rem;
		color: #999999;
	}
}
label {
	display: block;
    font-size: 1rem;
    font-weight: 400!important;
    cursor: pointer;
    .link {
        // text-decoration: underline;
        border-bottom: 1px solid #151515;
        &:hover {
            border-bottom: 1px solid transparent;
        }
    }
	input[type=file]:not(:focus-visible) {
		position: absolute !important;
		width: 1px !important;
		height: 1px !important;
		padding: 0 !important;
		margin: -1px !important;
		overflow: hidden !important;
		clip: rect(0, 0, 0, 0) !important;
		white-space: nowrap !important;
		border: 0 !important;
	}
	.smaller {
        
		font-size: 1rem;
	}
}
.image-list {
	display: flex;
	list-style: none;
	flex-wrap: wrap;
	padding: 1rem 0;
}
.upload-button {
	display: block;
	appearance: none;
	border: 0;
	border-radius: 50px;
	padding: 0.75rem 3rem;
	margin: 1rem auto;
	font-size: 1.25rem;
	font-weight: bold;
	background: #369;
	color: #fff;
	text-transform: uppercase;
}
button {
	cursor: pointer;
}

</style>
