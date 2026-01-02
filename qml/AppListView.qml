import QtQuick 2.12
import QtQuick.Controls 2.12
import QtQuick.Layouts 1.12
import Lomiri.Components 1.3

Page {
    id: appList

    title: i18n.tr("Apps")

    property var trustModels: []        // Injected from Main.qml
    signal appSelected(var appModel)    // Emitted on tap

    // Sorted model (risk → name)
    property var sortedModels: trustModels.slice().sort(function(a, b) {
        const order = { "high": 0, "medium": 1, "low": 2 }

        const riskDiff = order[a.trust.riskLevel] - order[b.trust.riskLevel]
        if (riskDiff !== 0) return riskDiff

        return a.displayName.localeCompare(b.displayName)
    })

    ListView {
        anchors.fill: parent
        model: sortedModels
        clip: true

        delegate: ListItem {
            width: parent.width
            height: units.gu(8) // Increased slightly for better breathability

            onClicked: appList.appSelected(modelData)

            RowLayout {
                anchors.fill: parent
                anchors.margins: units.gu(2)
                spacing: units.gu(2)

                Image {
                    source: modelData.iconPath || ""
                    Layout.preferredWidth: units.gu(5)
                    Layout.preferredHeight: units.gu(5)
                    fillMode: Image.PreserveAspectFit
                    visible: source !== ""
                }
                
                // Fallback icon placeholder if needed, simplified for now to just be blank space if missing

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: units.gu(0.5)

                    Label {
                        text: modelData.displayName
                        font.bold: true
                        elide: Text.ElideRight
                        Layout.fillWidth: true
                    }

                    Label {
                        text: i18n.tr("Score: %1").arg(modelData.trust.score)
                        color: theme.palette.normal.backgroundText
                        font.pixelSize: units.gu(1.5)
                    }
                }

                Label {
                    text: modelData.trust.riskLevel.toUpperCase()
                    color: {
                        if (modelData.trust.riskLevel === "high") return "#F44336"
                        if (modelData.trust.riskLevel === "medium") return "#FFC107"
                        return "#4CAF50"
                    }
                    font.bold: true
                    Layout.alignment: Qt.AlignVCenter
                }
            }
        }
    }
}
