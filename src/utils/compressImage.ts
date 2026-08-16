export async function compressImage(
    file: File,
): Promise<string> {
    const image = new Image();

    const objectUrl =
        URL.createObjectURL(file);

    try {
        await new Promise<void>(
            (resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () =>
                    reject(
                        new Error(
                            "Não foi possível carregar a imagem.",
                        ),
                    );

                image.src = objectUrl;
            },
        );

        const maxWidth = 1280;
        const maxHeight = 1280;

        let width = image.width;
        let height = image.height;

        if (width > maxWidth) {
            height =
                (height * maxWidth) /
                width;

            width = maxWidth;
        }

        if (height > maxHeight) {
            width =
                (width * maxHeight) /
                height;

            height = maxHeight;
        }

        const canvas =
            document.createElement(
                "canvas",
            );

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        const context =
            canvas.getContext("2d");

        if (!context) {
            throw new Error(
                "Não foi possível processar a imagem.",
            );
        }

        context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height,
        );

        return canvas.toDataURL(
            "image/jpeg",
            0.7,
        );
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}