import QtQuick 2.12
import QtQuick.Controls 2.12
import Lomiri.Components 1.3

Page {
    id: detail

    title: model.displayName

    property var model    // AppTrustModel injected on navigation

    function riskColor(level) {
        if (level === "high") return "#F44336"
        if (level === "medium") return "#FFC107"
        return "#4CAF50"
    }

    Flickable {
        anchors.fill: parent
        contentWidth: parent.width
        contentHeight: column.height
        clip: true

        Column {
            id: column
            width: parent.width
            spacing: units.gu(2)
            anchors.margins: units.gu(2)

            // 1. App Identity
            Row {
                spacing: units.gu(2)

                Image {
                    source: model.iconPath || ""
                    width: units.gu(6)
                    height: units.gu(6)
                    fillMode: Image.PreserveAspectFit
                }

                Column {
                    spacing: units.gu(0.5)
                    anchors.verticalCenter: parent.verticalCenter

                    Label {
                        text: model.displayName
                        font.bold: true
                        wrapMode: Text.WordWrap
                        width: parent.width - units.gu(8) // Account for icon + spacing
                    }

                    Label {
                        text: i18n.tr("Version %1").arg(model.version || "")
                        font.pixelSize: units.gu(1.5)
                    }
                }
            }

            // 2. Trust Score
            Rectangle {
                width: parent.width
                height: childrenRect.height + units.gu(4)
                radius: units.gu(1)
                color: theme.palette.normal.background

                Column {
                    anchors.margins: units.gu(2)
                    anchors.fill: parent
                    spacing: units.gu(1)

                    Label {
                        text: i18n.tr("Trust score")
                        font.bold: true
                    }

                    Row {
                        spacing: units.gu(2)

                        Label {
                            text: model.trust.score
                            font.pixelSize: units.gu(4)
                            font.bold: true
                        }

                        Label {
                            text: model.trust.riskLevel.toUpperCase()
                            color: riskColor(model.trust.riskLevel)
                            anchors.verticalCenter: parent.verticalCenter
                            font.bold: true
                        }
                    }
                }
            }

            // 3. Explanations
            Rectangle {
                width: parent.width
                height: childrenRect.height + units.gu(4)
                radius: units.gu(1)
                color: theme.palette.normal.background

                Column {
                    anchors.fill: parent
                    anchors.margins: units.gu(2)
                    spacing: units.gu(1)

                    Label {
                        text: i18n.tr("Why this score")
                        font.bold: true
                    }

                    Repeater {
                        model: detail.model.explanations.length > 0 ? detail.model.explanations
                                                             : [i18n.tr("No notable trust signals were found.")]

                        Label {
                            text: "• " + modelData
                            wrapMode: Text.WordWrap
                            width: parent.width
                        }
                    }
                }
            }

            // 4. Permissions Summary
            Rectangle {
                width: parent.width
                height: childrenRect.height + units.gu(4)
                radius: units.gu(1)
                color: theme.palette.normal.background

                Column {
                    anchors.fill: parent
                    anchors.margins: units.gu(2)
                    spacing: units.gu(1)

                    Label {
                        text: i18n.tr("Permissions")
                        font.bold: true
                    }

                    Label {
                        width: parent.width
                        text: {
                            const perms = []
                            if (detail.model.permissions.network) perms.push(i18n.tr("Network"))
                            if (detail.model.permissions.camera) perms.push(i18n.tr("Camera"))
                            if (detail.model.permissions.microphone) perms.push(i18n.tr("Microphone"))
                            if (detail.model.permissions.location) perms.push(i18n.tr("Location"))
                            if (detail.model.permissions.storage) perms.push(i18n.tr("Storage"))
                            return perms.length > 0 ? perms.join(", ")
                                                   : i18n.tr("No special permissions")
                        }
                        wrapMode: Text.WordWrap
                    }
                }
            }

            // 5. Update Info
            Rectangle {
                width: parent.width
                height: childrenRect.height + units.gu(4)
                radius: units.gu(1)
                color: theme.palette.normal.background

                Column {
                    anchors.fill: parent
                    anchors.margins: units.gu(2)
                    spacing: units.gu(1)

                    Label {
                        text: i18n.tr("Updates")
                        font.bold: true
                    }

                    Label {
                        width: parent.width
                        text: detail.model.updateInfo.updateAgeMonths !== null
                              ? i18n.tr("Last updated %1 months ago").arg(detail.model.updateInfo.updateAgeMonths)
                              : i18n.tr("Update information not available")
                        wrapMode: Text.WordWrap
                    }
                }
            }

            // 6. Maintainer Info
            Rectangle {
                width: parent.width
                height: childrenRect.height + units.gu(4)
                radius: units.gu(1)
                color: theme.palette.normal.background

                Column {
                    anchors.fill: parent
                    anchors.margins: units.gu(2)
                    spacing: units.gu(1)

                    Label {
                        text: i18n.tr("Maintainer")
                        font.bold: true
                    }

                    Label {
                        width: parent.width
                        text: detail.model.maintainer.present
                              ? detail.model.maintainer.name
                              : i18n.tr("No maintainer information provided")
                        wrapMode: Text.WordWrap
                    }
                }
            }

            // 7. Help Text
            Label {
                width: parent.width
                text: i18n.tr(
                    "Parallax provides information to help you understand app trust. "
                    + "It does not block or monitor apps."
                )
                wrapMode: Text.WordWrap
                color: theme.palette.normal.backgroundText
            }
        }
    }
}
