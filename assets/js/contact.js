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
            const promises = [], names = [];
            form.children('input, textarea').each((i, element) => {
                const elem = $(element);
                //returns a publicKey (or privateKey if you are importing a private key)
                const name = elem.attr('name');
                if (!name) return;
                names.push(name);
                promises.push(subtle.encrypt(
                    { name: 'RSA-OAEP' },
                    publicKey,
                    enc.encode(elem.val())
                ));
            });
            Promise.all(promises).then(encrypted => {
                for (let i = 0; i < encrypted.length; ++i)
                    //returns an ArrayBuffer containing the encrypted data
                    message[names[i]] = ab2str(encrypted[i]);
                $.post('https://contactee.herokuapp.com/', message, () => {
                    const form = $('form');
                    form.trigger('reset');
                    const div = $('<div>');
                    $('form').replaceWith(div.append(
                        $('<h3>').text('Message Submitted'),
                        $('<pre>').append($('<code>').text(JSON.stringify(message, null, 4))),
                        $('<button class="button">').text('Submit another message').click(event =>
                            div.replaceWith(form))));
                }).catch(err => console.log(err));
            }).catch(function (err) {
                console.error(err);
            });

        }).catch(function (err) {
            console.error(err);
        });
    });
});
