function User({ posts }: { posts: any[] }) {
    console.log(posts);
    return <div>
        {posts.map(item => {
            return <div key={item.year}>
                <h1>{item.year}</h1>
                {item.items.map((item: any) => {
                    return <p key={item.date}>{item.Date}: {item.To}: {item.Amount}: {item.Url}: {item.Memo}</p>
                })}
            </div>
        })}
    </div>
}

export async function getStaticPaths() {
    return { paths: [], fallback: "blocking" }
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps({ params }: { params: { slug: [string, string] } }) {
    const [id, token] = params.slug;
    console.log(params);
    const param = new URLSearchParams([
        ["token", token],
        ["spreadsheetId", id]
    ]);
    const res = await fetch('http://localhost:3000/api/spreadsheet/get?' + param, {
        headers: {
            'Content-Type': 'application/json'
        },
    })
    const posts = await res.json()

    return {
        props: {
            posts,
        },
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every second
        revalidate: 1, // In seconds
    }
}

export default User;
