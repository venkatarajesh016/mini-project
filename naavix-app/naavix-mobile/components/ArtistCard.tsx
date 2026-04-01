import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Artist } from '../data/mockData';
import { Colors, BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/theme';

interface ArtistCardProps {
    artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8}>
            <Image source={{ uri: artist.image }} style={styles.image} />
            <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>
            <Text style={styles.followers}>{artist.followers}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 100,
        marginRight: Spacing.lg,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: Spacing.sm,
    },
    name: {
        color: Colors.foreground,
        fontSize: FontSizes.xs,
        fontWeight: FontWeights.semibold,
        textAlign: 'center',
    },
    followers: {
        color: Colors.mutedForeground,
        fontSize: FontSizes.xs,
        marginTop: 2,
    },
});
