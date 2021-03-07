import { Box, Divider, Icon, Link, Stack } from "@chakra-ui/react";
import React from "react";
import { DiGithubBadge } from "react-icons/di";
import { IoLogoTwitter } from "react-icons/io";
import { MdEmail } from "react-icons/md";

type FooterLinkProps = {
    icon?: React.ElementType;
    href?: string;
    label?: string;
};
const serviceLinks = [
    {
        label: "利用規約",
        href: "https://github.com/azu/philan.net/blob/main/docs/ja/term-of-use.md"
    },
    {
        label: "プライバシーポリシー",
        href: "https://github.com/azu/philan.net/blob/main/docs/ja/privacy-poicy.md"
    }
];

const links = [
    {
        icon: DiGithubBadge,
        label: "GitHub",
        href: "https://github.com/azu"
    },
    {
        icon: IoLogoTwitter,
        label: "Twitter",
        href: "https://twitter.com/azu_re"
    },
    {
        icon: MdEmail,
        label: "Email",
        href: "mailto:info@philan.net"
    }
];
const FooterLink: React.FC<FooterLinkProps> = ({ icon, href, label }) => (
    <Link display="inline-block" href={href} aria-label={label} isExternal>
        <Icon as={icon} fontSize="xl" color="gray.400" />
    </Link>
);
export const Footer = () => (
    <Box as="footer" mt={12} textAlign="center">
        <Divider />
        <Stack mt={4} direction="row" spacing="12px" justify="center">
            {serviceLinks.map((link) => (
                <Link key={link.href} display="inline-block" href={link.href} aria-label={link.label} isExternal>
                    {link.label}
                </Link>
            ))}
        </Stack>
        <Stack mt={4} direction="row" spacing="12px" justify="center">
            {links.map((link) => (
                <FooterLink key={link.href} {...link} />
            ))}
        </Stack>
    </Box>
);
