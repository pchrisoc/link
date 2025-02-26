'use client'

import React, { useState } from 'react';
import { Accordion, TextInput, Title, Group, ActionIcon } from '@mantine/core';
import { IconCopy, IconDownload, IconLink, IconCheck } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import QRCode from 'qrcode.react';

export default function Form() {
  const [longURL, setLongURL] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [shortenedLinks, setShortenedLinks] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const domain = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      setIsFetching(true);
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: longURL,
          token: '',
          customAddress,
          domain,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newLink = {
          longURL: longURL,
          unique: data.data.unique,
        };
        // Prepend the new link so the latest appears on top
        setShortenedLinks((prev) => [newLink, ...prev]);
        // Show checkmark for successful shortening
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setLongURL('');
        setCustomAddress('');
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `There was an error shortening the URL. ${errorData.message}`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'There was a network error. Please try again later.',
      });
    } finally {
      setIsFetching(false);
    }
  };

  function copyToClipboard(shortenedURL) {
    navigator.clipboard.writeText(shortenedURL).then(() => {
      // Show checkmark for successful copy
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 3000);
    });
  }

  function downloadQRCode(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: '#121212',
          color: '#fff',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Title
          order={1}
          style={{
            marginBottom: '1.5rem',
            fontFamily: 'monospace',
            color: 'white',
          }}
        >
          links
        </Title>
        <form onSubmit={handleFormSubmit} style={{ marginBottom: '2rem', width: '100%', maxWidth: '500px' }}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TextInput
              id="longURL"
              placeholder="https://example.com"
              value={longURL}
              onChange={(e) => setLongURL(e.target.value)}
              required
              variant="filled"
              radius="xl"
              styles={{
                input: {
                  flex: 1,
                  maxWidth: '300px',
                  backgroundColor: '#333333',
                  borderRadius: '9999px',
                  color: 'white',
                },
                label: { color: 'white' },
              }}
            />
            <TextInput
              id="customAddress"
              placeholder="alias (optional)"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              variant="filled"
              radius="xl"
              styles={{
                input: {
                  flex: 1,
                  maxWidth: '200px',
                  backgroundColor: '#333333',
                  borderRadius: '9999px',
                  color: 'white',
                },
                label: { color: 'white' },
              }}
            />
            <ActionIcon
              type="submit"
              loading={isFetching}
              color="gray"
              radius="xl"
              size={42}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconLink size={20} />
            </ActionIcon>
          </div>
        </form>

        {shortenedLinks.map((link, index) => {
          const shortenedURL = `${
            typeof window !== 'undefined' ? window.location.origin : ''
          }/${link.unique}`;
          return (
            <div
              key={index}
              style={{
                marginBottom: '1.5rem',
                width: '100%',
                maxWidth: '500px',
                backgroundColor: '#1f1f1f',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <Group align="flex-end" style={{ marginBottom: '1rem', width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <TextInput
                    label="Shortened URL"
                    value={shortenedURL}
                    readOnly
                    variant="filled"
                    radius="xl"
                    styles={{
                      input: {
                        backgroundColor: '#333333',
                        borderRadius: '9999px',
                        color: 'white',
                      },
                      label: { color: 'white' },
                    }}
                  />
                </div>
                <ActionIcon
                  onClick={() => copyToClipboard(shortenedURL)}
                  variant="outline"
                  radius="xl"
                  size="lg"
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  <IconCopy size={20} />
                </ActionIcon>
              </Group>
              <Accordion variant="filled" defaultValue={[]} chevronPosition="right">
                <Accordion.Item value="qr">
                  <Accordion.Control style={{ color: 'white' }}>QR Code</Accordion.Control>
                  <Accordion.Panel>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <QRCode
                        id={`qr-gen-${index}`}
                        value={shortenedURL}
                        size={182}
                        level="H"
                        includeMargin={true}
                      />
                      <ActionIcon
                        onClick={() => downloadQRCode(`qr-gen-${index}`)}
                        variant="outline"
                        radius="xl"
                        size="lg"
                        style={{ marginTop: '1rem' }}
                        sx={{ borderColor: 'blue', color: 'blue' }}
                      >
                        <IconDownload size={20} />
                      </ActionIcon>
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
          );
        })}
      </div>

      {/* Checkmark for successful shortening */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '50%',
          zIndex: 9999,
          animation: 'fadeOut 3s forwards'
        }}>
          <IconCheck size={24} color="limegreen" />
        </div>
      )}

      {/* Checkmark for successful copy */}
      {showCopySuccess && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          padding: '10px',
          borderRadius: '50%',
          zIndex: 9999,
          animation: 'fadeOut 3s forwards'
        }}>
          <IconCheck size={24} color="limegreen" />
        </div>
      )}

      <style jsx global>{`
        html, body {
          overscroll-behavior: none;
          -webkit-overflow-scrolling: auto;
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (max-width: 600px) {
          .form-group {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
