'use client'

import React from 'react';
import { Navbar } from 'react-bootstrap';
import { ActionIcon, Anchor, Group, Text } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

export default function RoundedNavbar() {
  return (
    <>
      <Navbar
        className="custom-navbar"
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#333333',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
        }}
      >
        <Group spacing="xs" align="center">
          <ActionIcon variant="transparent">
            <IconHome size={24} color="white" />
          </ActionIcon>
          <Text size="sm" weight={500} c="white">
            |
          </Text>
          <Anchor
            href="/about"
            underline={false}
            style={{ color: 'white' }}
          >
            About
          </Anchor>
          <Anchor
            href="/projects"
            underline={false}
            style={{ color: 'white' }}
          >
            Projects
          </Anchor>
          <Anchor
            href="/game"
            underline={false}
            style={{ color: 'white' }}
          >
            Game
          </Anchor>
        </Group>
      </Navbar>
      <style jsx global>{`
        .custom-navbar a,
        .custom-navbar a:visited,
        .custom-navbar a:hover,
        .custom-navbar a:active {
          color: white !important;
          text-decoration: none !important;
        }
      `}</style>
    </>
  );
}
