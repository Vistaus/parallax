import QtQuick 2.12
import QtQuick.Controls 2.12
import Lomiri.Components 1.3

Page {
    id: home

    title: i18n.tr("Parallax")

    property var trustModels: []   // Injected from Main.qml

    // Aggregated values
    property int totalApps: trustModels.length
    property int lowRiskCount: trustModels.filter(m => m.trust.riskLevel === "low").length
    property int mediumRiskCount: trustModels.filter(m => m.trust.riskLevel === "medium").length
    property int highRiskCount: trustModels.filter(m => m.trust.riskLevel === "high").length

    // Navigation signal
    signal requestAppList()

    function summaryText() {
        if (highRiskCount > 0) {
            return i18n.tr("Some apps may require your attention.")
        }
        if (mediumRiskCount > 0) {
            return i18n.tr("Most of your apps have a low trust risk.")
        }
        return i18n.tr("Your apps appear to be in good standing.")
    }

    Column {
        anchors.fill: parent
        anchors.margins: units.gu(2)
        spacing: units.gu(2)

        // Summary Card
        Rectangle {
            width: parent.width
            height: summaryCol.height + units.gu(4) // Dynamic height based on content padding
            radius: units.gu(1)
            color: theme.palette.normal.background

            Column {
                id: summaryCol
                anchors.centerIn: parent
                width: parent.width - units.gu(4)
                spacing: units.gu(1)

                Label {
                    text: summaryText()
                    font.bold: true
                    wrapMode: Text.WordWrap
                    width: parent.width
                    horizontalAlignment: Text.AlignHCenter
                }

                Label {
                    text: i18n.tr("%1 apps installed").arg(totalApps)
                    color: theme.palette.normal.backgroundText
                    width: parent.width
                    horizontalAlignment: Text.AlignHCenter
                }
            }
        }

        // Risk Breakdown
        Rectangle {
            width: parent.width
            height: breakdownCol.height + units.gu(4)
            radius: units.gu(1)
            color: theme.palette.normal.background

            // Interaction Trigger
            MouseArea {
                anchors.fill: parent
                onClicked: home.requestAppList()
            }

            Column {
                id: breakdownCol
                anchors.centerIn: parent
                width: parent.width - units.gu(4)
                spacing: units.gu(1)

                Label {
                    text: i18n.tr("Trust overview")
                    font.bold: true
                    width: parent.width
                    horizontalAlignment: Text.AlignHCenter
                }

                Row {
                    anchors.horizontalCenter: parent.horizontalCenter
                    spacing: units.gu(2)

                    Label {
                        text: i18n.tr("Low: %1").arg(lowRiskCount)
                        color: "#4CAF50"    // muted green
                    }

                    Label {
                        text: i18n.tr("Medium: %1").arg(mediumRiskCount)
                        color: "#FFC107"    // amber
                    }

                    Label {
                        text: i18n.tr("High: %1").arg(highRiskCount)
                        color: "#F44336"    // soft red
                    }
                }
            }
        }
    }
}
