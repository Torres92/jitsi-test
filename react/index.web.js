/* global APP */

import React from 'react';
import ReactDOM from 'react-dom';

import { getJitsiMeetTransport } from '../modules/transport';

import { App } from './features/app/components';
import { getLogger } from './features/base/logging/functions';
import { Platform } from './features/base/react';
import { getJitsiMeetGlobalNS } from './features/base/util';
import PrejoinApp from './features/prejoin/components/PrejoinApp';

const logger = getLogger('index.web');
const OS = Platform.OS;

/**
 * Renders the app when the DOM tree has been loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
    const now = window.performance.now();

    APP.connectionTimes['document.ready'] = now;
    logger.log('(TIME) document ready:\t', now);
});

// Workaround for the issue when returning to a page with the back button and
// the page is loaded from the 'back-forward' cache on iOS which causes nothing
// to be rendered.
if (OS === 'ios') {
    window.addEventListener('pageshow', event => {
        // Detect pages loaded from the 'back-forward' cache
        // (https://webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/)
        if (event.persisted) {
            // Maybe there is a more graceful approach but in the moment of
            // writing nothing else resolves the issue. I tried to execute our
            // DOMContentLoaded handler but it seems that the 'onpageshow' event
            // is triggered only when 'window.location.reload()' code exists.
            window.location.reload();
        }
    });
}

/**
 * Stops collecting the logs and disposing the API when the user closes the
 * page.
 */
window.addEventListener('beforeunload', () => {
    // Stop the LogCollector
    if (APP.logCollectorStarted) {
        APP.logCollector.stop();
        APP.logCollectorStarted = false;
    }
    APP.API.notifyConferenceLeft(APP.conference.roomName);
    APP.API.dispose();
    getJitsiMeetTransport().dispose();
});

window.addEventListener('DOMContentLoaded', () => {
    // console.log('loadeddddddddddddddddddddddd', location.origin.substring(0, location.origin.length))
   
    if (location.origin == 'https://eurekatech.pe') {
        if (location.href.length == 68) {
            iniciarGrabacion_v3();
        }
    }
    if (location.origin == 'https://diversolatam.com') {
        if (location.href.length == 71) {
            iniciarGrabacion_v3();
        }
    }
    else {
        console.log('developer')
        iniciarGrabacion_v3();
    }

})

var contadorIntentosGrabacion = 0;
// Validar grabación 
function validarGrabacion_v3() {
    // validación en caso de que disparar grabación pero esta no ocurra
    if ($('.atlaskit-portal-container div:contains("All recorders are currently busy")').length > 0 ||
        Object.values(document.querySelectorAll('span'))
            .find(value => (value.innerHTML === 'Recording unavailable' ||
                value.innerHTML == 'Recording failed to start'
                || value.innerHTML === 'Grabación no disponible'))) {
        if (contadorIntentosGrabacion >= 5)
            return true;
        else {
            // console.log(document.querySelector("[data-testid='recording.unavailableTitle']"), 'hey parent element')
            if (document.querySelector("[aria-label='Toggle flag body']")) {
                //document.querySelector("[aria-label='Toggle flag body']").click()
            }
            contadorIntentosGrabacion = contadorIntentosGrabacion + 1;
            setTimeout(iniciarGrabacion_v3, 5000);
        }
    }
    else if ($('.atlaskit-portal-container div:contains("Grabando")').length > 0)
        return true;
    else {
        setTimeout(validarGrabacion_v3, 100);
    }
}

// Iniciar grabación 
function iniciarGrabacion_v3() {
    console.log('iniciando grabación')
    if ($('.circular-label:contains("REC")').length > 0)
        return true;

    // console.log('aqui grabandoooo ', document, document.querySelector("[aria-label='Toggle more actions menu']") === null, document.querySelector("[aria-label='Menú alternar más acciones']") === false)
    // if (!$('.button-group-right .toolbox-button-wth-dialog').last().find("[aria-label='Menú alternar más acciones']")) {
    //     setTimeout(iniciarGrabacion_v3, 5000);
    // }
    var language = localStorage.getItem('language').toString()
    var el = language == 'en' ? document.querySelector("[aria-label='Toggle more actions menu']") :
        document.querySelector("[aria-label='Menú alternar más acciones']")
    //chequea si el menú inglés o español esta disponible
    if (!el) {
        return setTimeout(iniciarGrabacion_v3, 5000);
    }

    el.click()
    var el2 = language == 'en' ? document.querySelector("[aria-label='Toggle recording']") :
        document.querySelector("[aria-label='Activar grabación']");
    console.log('before RESETT')
    if (!el2) {
        console.log('RESET 1');
        return setTimeout(iniciarGrabacion_v3, 5000)
    }
    // if ((lang == 'en' && !document.querySelector("[aria-label='Toggle recording']").length == 0) ||
    //     (lang == 'es' && !document.querySelector("[aria-label='Iniciar la grabación']").length == 0)) {
    //     // $('body').click();
    //     setTimeout(iniciarGrabacion_v3, 5000);
    // }
    else {
        console.log('Menu');
        el2.click()
        // lang == 'es' document.querySelector("[aria-label='Toggle recording']")?.click();
        if (document.querySelector('#modal-dialog-ok-button').length == 0
        ) {
            console.log('RESET 2');
            //$('body').click();
            setTimeout(iniciarGrabacion_v3, 5000);
        }
        else {
            console.log('INICIO GRABACION');
            document.querySelector('#modal-dialog-ok-button').click();
            validarGrabacion_v3();
        }
    }
}





const globalNS = getJitsiMeetGlobalNS();

globalNS.entryPoints = {
    APP: App,
    PREJOIN: PrejoinApp
};

globalNS.renderEntryPoint = ({
    Component,
    props = {},
    elementId = 'react'
}) => {
    ReactDOM.render(
        <Component {...props} />,
        document.getElementById(elementId)
    );
};
