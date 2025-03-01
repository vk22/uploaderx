const trackData = {
    artist: [ 'Cristian', 'M.' ],
    title: [ 'T.H.D.', '–', 'Solitaire', "(Shake's", 'Mix)' ]
}

let arr = []

for (let key in trackData) {
    arr = arr.concat(trackData[key])
}

console.log(arr.join('+'))