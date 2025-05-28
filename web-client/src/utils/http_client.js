/**
 * This file is part of MangaFace.
 *
 * (c) Milad Abdollahnia <miladniaa@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

function HttpClient() {

    /**
     * Send data to the server to create the final image.
     */
    this.post = function (values, callback) {
        $.ajax({
            url: "./image.php", // TODO move it to a config file.
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(values)
        })
            .complete(function (res) {
                callback(res["responseText"]);
            })
            .error(function () {
                alert("Error: Connection Failed!");
            });
    };
}

export default HttpClient;
