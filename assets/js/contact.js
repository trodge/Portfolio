function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

$(document).ready(() => {
    const subtle = crypto.subtle;
    const enc = new TextEncoder();
    const form = $('form');
    form.submit(event => {
        event.preventDefault();
        message = {};
        subtle.importKey(
            'jwk', //can be 'jwk' (public or private), 'spki' (public only), or 'pkcs8' (private only)
            {   //this is an example jwk key, other key types are Uint8Array objects
                kty: 'RSA',
                e: 'AQAB',
                n: 'rZP3F3IxZvCHVeOyDWe86Y32RdgQ61LCFBu4IMtfN5Qke6IlIAKsKXbv25T5bk7AKzRFFpuWKSJfqtqPC-o1-2y-jfTcrYHRo_tCTDf8q2BeGOt2eUYKfgCkcoTVjokn9G_TLRXBhc7KiYMtx2Pnbz2g8zRDCrglepSwHRPsQ3rLO8RW5cuwT0YjxHLThaqOY1I_6psauttJAzGoD50kMhqcrJAPRXNPa4wAAuEXPIEb66iFskOrwvQ2Q81RFTppcXhusTeC-za5-NQppJZXh_PPkW6suV3sPxxMWYUWRBF4FVZi4UPh4VDIhKR-2NnldSPw3ScW7TPPhAJB2-u6Fw',
                alg: 'RSA-OAEP-256',
                ext: true,
            },
            {   //these are the algorithm options
                name: 'RSA-OAEP',
                hash: { name: 'SHA-256' }, //can be 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ['encrypt'] //'encrypt' or 'wrapKey' for public key import or
            //'decrypt' or 'unwrapKey' for private key imports
        ).then(publicKey => {
            const subtlePromises = [], names = [];
            form.children('input, textarea').each((i, element) => {
                const elem = $(element);
                //returns a publicKey (or privateKey if you are importing a private key)
                const name = elem.attr('name');
                if (!name) return;
                names.push(name);
                subtlePromises.push(subtle.encrypt(
                    { name: 'RSA-OAEP' },
                    publicKey,
                    enc.encode(elem.val())
                ));
            });
            // Wait for encryption to take place.
            Promise.all(subtlePromises).then(buffers => {
                // Convert arraybuffers to strings.
                buffers.forEach((buffer, i) => message[names[i]] = ab2str(buffer));
                // Post said strings to heroku.
                $.post('https://contactee.herokuapp.com/', message, () => {
                    // Inform user that their message is submitted.
                    const elements = [$('<h3>').text('Message Submitted')];
                    for (let item in message) {
                        elements.push($('<h4>').text(item));
                        elements.push($('<p>').text(message[item]));
                    }
                    elements.push($('<button class="button">')
                        .text('Submit another message')
                        .click(() => location.reload()));
                    $('form').replaceWith($('<div>').append(elements));
                }).catch(err => console.log(err));
            }).catch(function (err) {
                console.error(err);
            });

        }).catch(function (err) {
            console.error(err);
        });
    });
});
