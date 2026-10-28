/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
    branches: [
        "master",
        {
            name: "*-rc",
            prerelease: true,
            channel: "rc",
        }
    ],
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        [
            "@semantic-release/changelog",
            {
                changelogFile: "CHANGELOG.md"
            }
        ],
        [
            "@semantic-release/npm",
            {
                npmPublish: true
            }
        ],
        [
            "@semantic-release/git",
            {
                assets: [
                    "CHANGELOG.md",
                    "package.json"
                ],
                message: "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}"
            }
        ],
        [
            "@semantic-release/github",
            {
                failCommentCondition: false
            }
        ]
    ]
};
