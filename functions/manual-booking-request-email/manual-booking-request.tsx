import * as React from "npm:react";
import {
    Body,
    Button,
    Column,
    Container,
    Font,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from 'npm:@react-email/components';

type ManualBookingRequestProps = {
    // Map of placeholder key -> value, e.g. { "Client First Name": "Sam", "auto-fill-title": "Floral sleeve" }
    email_templates: {
        subject: string;
        body: string;
    };
    avatar_url: string;
    variables?: Record<string, string | readonly string[]>;
    payment_links?: Record<string, string>;
};

function normalizeKey(key: string): string {
    return key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getVariable(variables: Record<string, string | readonly string[]>, name: string, fallback: string): string {
    const target = normalizeKey(name);
    for (const [k, v] of Object.entries(variables)) {
        if (normalizeKey(k) === target) {
            if (Array.isArray(v)) return v.join('\n');
            if (typeof v === 'string') return v;
            return fallback;
        }
    }
    return fallback;
}

function renderTemplate(template: string, variables: Record<string, string | readonly string[]>): string {
    if (!template) return '';
    // Replace [key] - always keep wrapper if missing
    let result = template.replace(/\[([^\]]+)\]/g, (_match, key: string) => {
        if (key in variables) {
            const val = variables[key];
            if (Array.isArray(val)) return val.join('\n');
            return typeof val === 'string' ? val : '';
        }
        const normalized = normalizeKey(key);
        for (const [k, v] of Object.entries(variables)) {
            if (normalizeKey(k) === normalized) {
                if (Array.isArray(v)) return v.join('\n') ?? '';
                return typeof v === 'string' ? v : '';
            }
        }
        return `[${key}]`;
    });
    // Replace (key) - only replace if variable exists, otherwise keep as-is
    result = result.replace(/\(([^)]+)\)/g, (match: string, key: string) => {
        const hasDirect = key in variables;
        let found: string | readonly string[] | undefined;
        if (hasDirect) {
            found = variables[key];
        } else {
            const normalized = normalizeKey(key);
            for (const [k, v] of Object.entries(variables)) {
                if (normalizeKey(k) === normalized) {
                    found = v;
                    break;
                }
            }
        }
        if (found === undefined) return match;
        if (Array.isArray(found)) return found.join('\n');
        return typeof found === 'string' ? found : match;
    });
    return result;
}

export default function ManualBookingRequest({ variables, email_templates, payment_links, avatar_url }: ManualBookingRequestProps) {

    const resolvedSubject = renderTemplate(email_templates.subject, variables);
    const resolvedBody = renderTemplate(email_templates.body, variables);
    const previewFirstLine = resolvedBody.split('\n').find((l) => l.trim().length > 0);

    const artistName = getVariable(variables, 'Your Name', 'Simple Tattooer');
    const previewText = previewFirstLine ?? "Thanks for sending your idea my way!";

    type Segment =
        | { type: 'text'; content: string }
        | { type: 'button'; label: string }
        | { type: 'buttons_from_payment_links' };

    const parseBodySegments = (text: string): Segment[] => {
        const segments: Segment[] = [];
        // Matches: (Button- Label) or (Buttons- label1|label2|...) or (insert clickable payment links here)
        const regex = /\((Button|Buttons)-\s*([^)]+)\)|\((?:insert clickable payment links here)\)/gi;
        let lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
            const idx = match.index;
            if (idx > lastIndex) {
                segments.push({ type: 'text', content: text.slice(lastIndex, idx) });
            }
            const kind = match[1];
            const payload = match[2];
            if (!kind) {
                // insert clickable payment links here
                segments.push({ type: 'buttons_from_payment_links' });
            } else if (/^Button$/i.test(kind)) {
                const label = (payload || '').trim();
                segments.push({ type: 'button', label });
            } else if (/^Buttons$/i.test(kind)) {
                const labels = (payload || '').split(/[|,]/).map((l) => l.trim()).filter(Boolean);
                if (labels.length === 0) {
                    segments.push({ type: 'buttons_from_payment_links' });
                } else {
                    for (const lbl of labels) {
                        segments.push({ type: 'button', label: lbl });
                    }
                }
            }
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            segments.push({ type: 'text', content: text.slice(lastIndex) });
        }
        return segments;
    };

    const segments = parseBodySegments(resolvedBody);

    const renderTextWithBreaks = (text: string) => {
        const parts: React.ReactNode[] = [];
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length > 0) parts.push(line);
            if (i < lines.length - 1) parts.push(<br key={`br-${i}-${line.length}`} />);
        }
        return parts;
    };

    const resolveButtonHref = (label: string): string => {
        const fromVar = getVariable(variables, label, '');
        if (fromVar) return fromVar;
        if (payment_links && payment_links[label]) return payment_links[label];
        return '#';
    };

    return (
        <Html>
            <Tailwind>
                <Head>
                    <Font
                        fontFamily="Arial"
                        fallbackFontFamily="Arial"
                        webFont={{
                            url: "https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/fonts/arial_ce.woff2",
                            format: "woff2",
                        }}
                        fontWeight={400}
                        fontStyle="normal"
                    />
                    {/* Email-safe responsive helpers */}
                    <style>
                        {`
                        .desktop-hide { display: none !important; }
                        @media only screen and (max-width: 480px) {
                            .mobile-block { display: block !important; width: 100% !important; }
                            .mobile-center { text-align: center !important; }
                            .mobile-hide { display: none !important; }
                            .mobile-mt-16 { margin-top: 16px !important; }
                        }
                        `}
                    </style>
                </Head>
                <Preview>{previewText}</Preview>
                <Body className="mx-auto my-auto max-w-[600px] bg-[#05080F] font-sans">
                    <Container className="mx-auto max-w-[600px] py-[40px] px-4">
                        {/* Header with title and avatar */}
                        <Section className="mx-auto max-w-[472px]">
                            <Row>
                                <Column className="mobile-block desktop-hide mb-5" align="center">
                                    <Img
                                        src={avatar_url}
                                        alt={`${artistName}'s desktop`}
                                        width="100"
                                        height="100"
                                        style={{ borderRadius: '50px' }}
                                    />
                                </Column>
                                <Column className="mobile-block" style={{ verticalAlign: 'middle' }}>
                                    <Heading className="text-white text-[24px] font-normal p-0 m-0 text-left mobile-center">{resolvedSubject}</Heading>
                                    <Text className="text-white text-[16px] leading-[20px] my-0 mt-2 mobile-center">with {artistName}</Text>
                                </Column>
                                <Column className="mobile-hide" align="right" style={{ verticalAlign: 'middle' }}>
                                    <Img
                                        src={avatar_url}
                                        alt={artistName}
                                        width="100"
                                        height="100"
                                        style={{ borderRadius: '50px' }}
                                    />
                                </Column>
                            </Row>
                        </Section>

                        {/* Body copy */}
                        <Section className='mt-[28px] mx-auto max-w-[472px]'>
                            {segments.map((seg, idx) => {
                                if (seg.type === 'text') {
                                    const content = seg.content;
                                    if (!content) return null;
                                    return (
                                        <Text key={`t-${idx}`} className="text-white text-[16px] leading-[22px] my-0">
                                            {renderTextWithBreaks(content)}
                                        </Text>
                                    );
                                }
                                if (seg.type === 'button') {
                                    const href = resolveButtonHref(seg.label);
                                    return (
                                        <Button
                                            key={`b-${idx}`}
                                            className="w-full text-white text-[14px] font-normal no-underline text-center px-5"
                                            href={href}
                                            style={{ height: '40px', lineHeight: '38px', display: 'block', maxWidth: '100%', boxSizing: 'border-box', borderRadius: '20px', border: '1px solid #94A3B8' }}
                                        >
                                            {seg.label}
                                        </Button>
                                    );
                                }
                                // buttons_from_payment_links
                                return (
                                    <React.Fragment key={`pl-${idx}`}>
                                        {payment_links &&
                                            Object.entries(payment_links).map(([key, value]) => (
                                                <React.Fragment key={`pl-btn-${key}`}>
                                                    <Button
                                                        className="w-full text-white text-[14px] font-normal no-underline text-center px-5"
                                                        href={value}
                                                        style={{ height: '40px', lineHeight: '38px', display: 'block', maxWidth: '100%', boxSizing: 'border-box', borderRadius: '20px', border: '1px solid #94A3B8' }}
                                                    >
                                                        {key}
                                                    </Button>
                                                    {key !== Object.keys(payment_links)[Object.keys(payment_links).length - 1] && <br />}
                                                </React.Fragment>
                                            ))}
                                    </React.Fragment>
                                );
                            })}
                        </Section>

                        {/* Footer */}
                        <Section className='mt-[40px] mx-auto max-w-[472px]'>
                            <Row>
                                <Column className="mobile-block" style={{ verticalAlign: 'top' }}>
                                    <Text className="text-white text-[10px] leading-[14px] my-0 mb-2">Download Our App</Text>
                                    <Row>
                                        <Column align='left'>
                                            <Link href="https://play.google.com/store">
                                                <Img
                                                    src="https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/android_store_btn.png"
                                                    alt="Get it on Google Play"
                                                    width="96"
                                                    height="32"
                                                    style={{ display: 'inline' }}
                                                />
                                            </Link>
                                            &nbsp;&nbsp;
                                            <Link href="https://apps.apple.com/app">
                                                <Img
                                                    src="https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/apple_store_btn.png"
                                                    alt="Download on the App Store"
                                                    width="96"
                                                    height="32"
                                                    style={{ display: 'inline' }}
                                                />
                                            </Link>
                                        </Column>
                                    </Row>
                                </Column>
                                <Column className="mobile-block mobile-mt-16" width="45px" style={{ verticalAlign: 'top' }}>
                                    <Text className="text-white text-[10px] leading-[14px] my-0 mb-2">Follow Us</Text>
                                    <Link href="https://instagram.com" target="_blank">
                                        <Img
                                            src="https://lkzdwcjvzyrhsieijjdr.supabase.co/storage/v1/object/public/assets/icons/mdi_instagram.png"
                                            alt="Instagram"
                                            width="24"
                                            height="24"
                                        />
                                    </Link>
                                </Column>
                            </Row>
                            <Hr style={{ borderColor: '#1E293B' }} />
                            <Text className="text-white text-[12px] leading-[16px] my-0 mt-3">© 2025 Simple Tattooer. All Rights Reserved</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}