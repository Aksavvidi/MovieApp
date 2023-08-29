$(document).ready(function() {
    let debounceTimeout = null;
    $('#searchInput').on('input', function() {
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => getMovie(this.value.trim()), 1500) //this ειναι για το #searchInput 
    })
    
    $('.showMore').on('click', function(e) {
        e.preventDefault()
        onShowMoreClicked()
    })

})

/**
 * Use the movie title provided by the user to search and show the movie.
 */

function getMovie(title){
    if (!title){
        return
    }

    onBeforeSend()
    fetchMovieFromApi(title)
}

function fetchMovieFromApi(title) {
    let ajaxReq = new XMLHttpRequest();
    ajaxReq.open('GET',`http://www.omdbapi.com/?t=${title}&apikey=[44c43e58]&`, true);
    ajaxReq.timeout =5000
    ajaxReq.ontimeout = (e) => onApiError()

    ajaxReq.onreadystatechange = function() {
        if(ajaxReq.readyState === 4) {
            if(ajaxReq.status === 200) {
                handleResults(JSON.parse(xhr.responseText))
            }else {}
                onApiError()
        }
    }
    ajaxReq.send()
}

/**
 * Determines if the API found a movie or not.
 * If it's found , the API response, is transformed and then shown.
 * Else, show a message "vot found".
 */

function handleResults(response) {
    if(response.Response == 'True') {
        
    let transformedMovie = transformedMovieResponse(transformedMovie)
    buildMovie(transformedMovie)
    }else if (response.Response == 'False'){
        hideComponent('#waiting')
        showNotFound()
    }   
}

/**
 * Assigned transformed API response to the corresponding UI elements. 
 */

function buildMovie(apiResponse){
    if(apiResponse.poster) {        //if there is a poster of the movie, show it
        $('#image').attr('src', apiResponse.poster).on('load', function() {    //load the poster
            buildMovieMetadata(apiResponse, $(this))
        })
    }else {                     // show every other detail of the movie
        buildMovieMetadata(apiResponse)
    }
}

/**
 * Actions to take before the search query is sent, like hiding any previous information about a movie.
 */

function onBeforeSend() {
    showComponent('#waiting')
    hideComponent('.movie')
    hideNotFound()
    hideError()
    collapsePlot()
    hideExtras()
}

/**
 * Actions to take if the movie API fails to respond.
 */

function onApiError() {
    hideComponent('#waiting')
    showError()
}

/**
 * Adds the metadata of the movie to the appropriate fields. 
 */

function buildMovieMetadata (apiResponse, imageTag) {
    hideComponent('#waiting')
    handleImage(imageTag)
    handleLiterals(apiResponse)
    showComponent('.movie')
}

/**
 * Shows the movie poster if any, else just hide.
 */

function handleImage(imageTag) {
    imageTag ? $('#image').replaceWith(imageTag) : $('#image').removeAttr('src')
}

/**
 * Fills the values of the corresponding HTML elements using the API response.
 */

function handleLiterals(apiResponse) {
    $('.movie').find(['id']).each((index, item) => {  // find all items in div with class movie that have an id
        if ($(item).is('a')) {      // if it's a link, then update the href
            $(item).attr('href', apiResponse[item.id])
        }else {                    //for every other element just update the text
            let valueElement = $(item).children('span')
            let metadataValue = apiResponse[item.id] ? apiResponse [item.id] : '-'
            valueElement.length ? valueElement.text(metadataValue) : $(item).text(metadataValue)
        }
    })
}

/**
 * Transform API response
 */

function transfomrResponse(apiResponse) {
    let camelCasekeysResponse = camelCasekeys(apiResponse)
    clearNotAvailableInformation(camelCasekeysResponse)
    buildImdbLink(camelCasekeysResponse)
    return camelCasekeysResponse
}

/**
 * Transforms the object keys of the API Response to camel case.
 */
function camelCasekeys(apiResponse) {
    return _.mapKeys(apiResponse, (v, k) => _.camelCase(k))
}
/**
 * Transfroms the imdb id given by the API Response to the corresponding imdb url.
 */
function buildImdbLink(apiResponse) {
    if(apiResponse.imdbId && apiResponse.imdbId !== 'N/A') {
        apiResponse.imdbId = `https://wwww.imdb.com/title/${apiResponse.imdbId}`
    }
}

/**
 * Replace the API Response from N/A (= Not Available) to empty string values.
 */

function clearNotAvailableInformation(apiResponse) {
    for (var key in apiResponse) {
        if(apiResponse.hasOwnProperty(key) && apiResponse[key] === 'N/A') {
            apiResponse[key] = ''
        }
    }
}
function onShowMoreClicked() {
    $('#plot').toggleClass('expanded')
    if ($('.extended').is(':visible')){
        $('.extended').hide(700)
    }else {
        $('.extended').show(700)
    }
}
/**
 * Hides a component identified by the provide jquery selector.
 * The component is returned for further chained calls.
 */
function hideComponent(jquerySelector) {
    return $(jquerySelector).addClass('hidden')
}
/**
 * Shows a component identified by the provide jquery selector.
 * The component is returned for further chained calls. 
 */
function showComponent(jquerySelector) {
    return$(jquerySelector).removeClass('hidden')
}

function showNotFound() {
    $('.center').clone().removeClass('hidden').appendTo($('.center'))
}

function hideNotFound() {
    $('.center').find('.not-found').remove()
}

function showError() {
    $('.error').clone().removeClass('hidden').appendTo($('.center'))
}

function hideError() {
    $('.center').find('.error').remove()
}

function hideExtras() {
    $('extended').hide()
}

function collapsePlot() {
    $('#plot').removeClass('expanded')
}
