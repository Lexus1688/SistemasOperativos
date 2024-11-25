import React from "react";
import { useTranslation } from "react-i18next";

interface LocaleImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    default: string;
    languages?: {[key: string]: string};
}

function LocaleImage(props: LocaleImageProps) {
    const { t, i18n } = useTranslation();

    let imageSource: string;
    if ((props.languages != undefined) && (i18n.language in props.languages)) {
        imageSource = props.languages[i18n.language];     
    } else {
        imageSource = props.default;
    }

    return (
        <img {...props} src={imageSource} />
    );
}

export default LocaleImage;