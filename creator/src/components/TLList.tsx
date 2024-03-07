import type { FC } from "react"

export type TL = {
    id: string;
    ogname: string;
    tlname: string;
}

interface TLListProps {
    tls: TL[]
}

export const TLList: FC<TLListProps> = ({ tls }) => {
    return <>{tls.map(tl => <div key={tl.id}>{tl.ogname} / {tl.tlname} ({tl.id.substring(0,5)}...)</div>)}</>
}