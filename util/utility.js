module.exports = {
    id3MetadataObject: function (metadata) {
        return {
            title: metadata.title.value,
            artist: metadata.contributingArtist.value,
            performerInfo: metadata.albumArtist.value,
            album: metadata.album.value,
            year: metadata.year.value,
            genre: metadata.genre.value
        }
    }
}
