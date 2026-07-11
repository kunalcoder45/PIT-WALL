const queue: (() => Promise<void>)[] = [];

let running = false;

const MAX_REQUEST_PER_SECOND = 2;


async function processQueue() {
    if (running) return;

    running = true;

    while (queue.length > 0) {

        const batch = queue.splice(0, MAX_REQUEST_PER_SECOND);

        await Promise.all(
            batch.map((job) => job())
        );


        // wait 1 second
        await new Promise((resolve) =>
            setTimeout(resolve, 1000)
        );
    }

    running = false;
}



export function addToQueue<T>(
    request: () => Promise<T>
): Promise<T> {

    return new Promise((resolve, reject) => {


        queue.push(async () => {

            try {

                const result = await request();

                resolve(result);

            } catch (error) {

                reject(error);

            }

        });


        processQueue();

    });
}