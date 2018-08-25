'use strict';

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const request = require('request');

// https://stackoverflow.com/a/45007624/4379921
function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest, { flags: 'wx' });
        const req = request.get(url);

        req.on('response', res => {
            if (res.statusCode === 200) {
                res.pipe(file);
            } else {
                file.close();
                fs.unlink(dest, () => {}); // Delete temp file
                reject(`Server responded with ${res.statusCode}: ${res.statusMessage}`);
            }
        });

        req.on('error', err => {
            file.close();
            fs.unlink(dest, () => {}); // Delete temp file
            reject(err.message);
        });

        file.on('finish', () => {
            resolve();
        });

        file.on('error', err => {
            file.close();

            if (err.code === 'EEXIST') {
                reject('File already exists');
            } else {
                fs.unlink(dest, () => {}); // Delete temp file
                reject(err.message);
            }
        });
    });
}

module.exports = callback => {
    const assetsPath = 'Portugol-Studio-master/ide/src/main/assets/';
    const recursos = path.join(__dirname, 'public', 'recursos/');
    const recursosTemp = path.join(__dirname, 'public', 'recursos.temp/');
    const psZip = path.join(__dirname, 'public', 'Portugol-Studio.zip');

    // Excluir o ZIP caso tenha havido uma interrupção durante o download anterior
    if (fs.existsSync(psZip)) {
        fs.unlinkSync(psZip);
    }

    if (fs.existsSync(recursos)) {
        console.log('O diretório Recursos foi encontrado! Caso queira atualizar os recursos basta excluir o seguinte diretório:');
        console.log(`-> ${recursos}`);
        callback();
    } else {
        console.log('O diretório de recursos não foi encontrado!');
        console.log('Baixando a versão mais recente do código-fonte do Portugol Studio...');

        download('https://github.com/UNIVALI-LITE/Portugol-Studio/archive/master.zip', psZip)
            .then(() => {
                console.log('Download concluído, extraindo os recursos de ajuda...');

                const zip = new AdmZip(psZip);

                console.log(`Extraindo [Portugol-Studio.zip]/${assetsPath} para ${recursosTemp}...`);
                zip.extractEntryTo(assetsPath, recursosTemp, true, true);

                console.log(`Refazendo estrutura do diretório...`);
                fs.renameSync(recursosTemp + assetsPath, recursos);

                console.log('Removendo arquivos temporários...');
                fs.rmdirSync(path.join(recursosTemp, 'Portugol-Studio-master', 'ide', 'src', 'main'));
                fs.rmdirSync(path.join(recursosTemp, 'Portugol-Studio-master', 'ide', 'src'));
                fs.rmdirSync(path.join(recursosTemp, 'Portugol-Studio-master', 'ide'));
                fs.rmdirSync(path.join(recursosTemp, 'Portugol-Studio-master'));
                fs.rmdirSync(recursosTemp);
                fs.unlinkSync(psZip);

                console.log('Configuração de recursos concluída!');
                callback();
            })
            .catch(err => console.error(`Falha ao baixar o código-fonte do Portugol Studio: ${err} - Reinicie o Portugol Webstudio para tentar novamente.`) && callback())
    }
}
