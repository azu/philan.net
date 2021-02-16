import { useEffect } from "react";

export default function Edit() {
    useEffect(() => {
        fetch("/user/meta/azu")
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                console.log(res);
            });
    });
    return <div>Edit</div>;
}
